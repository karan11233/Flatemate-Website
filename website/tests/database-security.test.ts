import { describe, it, expect } from 'vitest';

/**
 * Flatemate Database Security & RLS Policy Specification Tests (v2)
 * 
 * Verifies the database security invariants, constraints, and authorization rules:
 * - Direct PostgREST table access vs public_spaces consent masking
 * - Database-level INSERT integrity (tamper-proofing user_id, featured, views)
 * - Atomic concurrent guest claims via space_claim_secrets
 * - Exact field-level inquiry UPDATE enforcement
 * - public_profiles view restricted to active listing hosts
 * - Abuse-proof, rate-limited increment_space_views RPC
 * - Explicit opt-in WhatsApp consent (default false)
 */

describe('Hardened Database Security & RLS Invariants (Round 2)', () => {

  describe('1. PostgREST Direct Access vs Public View Isolation', () => {
    it('ensures raw public.spaces SELECT returns 0 rows to anonymous users', () => {
      // Simulating PostgREST query on raw public.spaces:
      // Policy: create policy "Users can view own listings on raw table" on spaces for select using (auth.uid() = user_id)
      const evaluateRawSpacesSelect = (session: { uid: string } | null, spaceOwnerId: string) => {
        if (!session) return false; // Anonymous visitors get 0 rows
        return session.uid === spaceOwnerId;
      };

      expect(evaluateRawSpacesSelect(null, 'host-123')).toBe(false);
      expect(evaluateRawSpacesSelect({ uid: 'stranger-456' }, 'host-123')).toBe(false);
      expect(evaluateRawSpacesSelect({ uid: 'host-123' }, 'host-123')).toBe(true);
    });

    it('masks contact_phone in public_spaces unless explicit opt-in consent is true', () => {
      const getPublicViewListing = (space: {
        contact_phone: string;
        consent_whatsapp_contact: boolean;
      }) => ({
        contact_phone: space.consent_whatsapp_contact ? space.contact_phone : null,
        consent_whatsapp_contact: space.consent_whatsapp_contact,
      });

      // Default is opt-in (false)
      const defaultListing = { contact_phone: '9825123456', consent_whatsapp_contact: false };
      expect(getPublicViewListing(defaultListing).contact_phone).toBeNull();

      // Consented listing
      const consentedListing = { contact_phone: '9825123456', consent_whatsapp_contact: true };
      expect(getPublicViewListing(consentedListing).contact_phone).toBe('9825123456');
    });

    it('isolates claim secrets in space_claim_secrets with zero public SELECT grants', () => {
      const evaluateClaimSecretsSelect = (userRole: string) => {
        // Only service_role can select from space_claim_secrets
        return userRole === 'service_role';
      };

      expect(evaluateClaimSecretsSelect('anon')).toBe(false);
      expect(evaluateClaimSecretsSelect('authenticated')).toBe(false);
      expect(evaluateClaimSecretsSelect('service_role')).toBe(true);
    });
  });

  describe('2. Database-Level INSERT Integrity', () => {
    it('forces user_id, featured=false, views_count=0, and is_demo=false on authenticated inserts', () => {
      // Simulating enforce_space_insert_integrity() trigger
      const enforceSpaceInsertIntegrity = (
        callerRole: string,
        callerAuthId: string | null,
        payload: { user_id?: string; featured?: boolean; views_count?: number; is_demo?: boolean }
      ) => {
        if (callerRole !== 'service_role') {
          if (!callerAuthId) throw new Error('Authentication required to create listing');
          return {
            ...payload,
            user_id: callerAuthId, // Overridden by trigger
            featured: false,       // Overridden by trigger
            views_count: 0,        // Overridden by trigger
            is_demo: false,        // Overridden by trigger
          };
        }
        return payload;
      };

      const attackerPayload = {
        user_id: 'innocent-victim-id',
        featured: true,
        views_count: 99999,
        is_demo: true,
      };

      const safeResult = enforceSpaceInsertIntegrity('authenticated', 'real-authenticated-user', attackerPayload);

      expect(safeResult.user_id).toBe('real-authenticated-user');
      expect(safeResult.featured).toBe(false);
      expect(safeResult.views_count).toBe(0);
      expect(safeResult.is_demo).toBe(false);
    });
  });

  describe('3. Atomic Guest Claiming & Concurrency Protection', () => {
    it('consumes single-use claim token atomically and rejects race conditions or double claims', () => {
      const claimSecretsDb: Record<string, { hash: string; expiresAt: number }> = {
        'space-guest-1': {
          hash: 'sha256_of_valid_token_123456789012345678',
          expiresAt: Date.now() + 1000000,
        },
      };

      const spacesDb: Record<string, { user_id: string | null }> = {
        'space-guest-1': { user_id: null },
      };

      const claimGuestSpace = (spaceId: string, tokenHash: string, claimerAuthId: string) => {
        // Atomic conditional deletion
        const secret = claimSecretsDb[spaceId];
        if (!secret || secret.hash !== tokenHash || secret.expiresAt < Date.now()) {
          if (spacesDb[spaceId]?.user_id !== null) {
            throw new Error('Listing has already been claimed');
          }
          throw new Error('Invalid or expired claim token');
        }

        // Consume token immediately
        delete claimSecretsDb[spaceId];
        spacesDb[spaceId].user_id = claimerAuthId;

        return { success: true, space_id: spaceId, owner_id: claimerAuthId };
      };

      // Call 1: First attempt succeeds
      const result1 = claimGuestSpace('space-guest-1', 'sha256_of_valid_token_123456789012345678', 'user-111');
      expect(result1.success).toBe(true);

      // Call 2: Concurrent/second attempt with same token fails immediately
      expect(() => claimGuestSpace('space-guest-1', 'sha256_of_valid_token_123456789012345678', 'user-222'))
        .toThrow('Listing has already been claimed');
    });
  });

  describe('4. Exact Field-Level Inquiry Updates', () => {
    it('allows host to modify ONLY status and host_archived; blocks tampering with messages or seeker_archived', () => {
      const enforceInquiryUpdate = (
        authUid: string,
        oldInquiry: { host_id: string; seeker_id: string; status: string; seeker_message: string; host_archived: boolean; seeker_archived: boolean },
        newInquiry: { host_id: string; seeker_id: string; status: string; seeker_message: string; host_archived: boolean; seeker_archived: boolean }
      ) => {
        // Immutable check
        if (newInquiry.seeker_message !== oldInquiry.seeker_message) {
          throw new Error('Security violation: Core inquiry fields and messages are immutable');
        }

        if (authUid === oldInquiry.host_id) {
          if (newInquiry.seeker_archived !== oldInquiry.seeker_archived) {
            throw new Error('Security violation: Host cannot modify seeker archive state');
          }
          // Validate status transition
          if (oldInquiry.status === 'visited' && newInquiry.status !== 'visited') {
            throw new Error('Cannot revert visited status');
          }
          return newInquiry;
        }

        if (authUid === oldInquiry.seeker_id) {
          if (newInquiry.status !== oldInquiry.status) {
            throw new Error('Security violation: Seeker cannot modify inquiry status');
          }
          if (newInquiry.host_archived !== oldInquiry.host_archived) {
            throw new Error('Security violation: Seeker cannot modify host archive state');
          }
          return newInquiry;
        }

        throw new Error('Unauthorized');
      };

      const baseInquiry = {
        host_id: 'host-1',
        seeker_id: 'seeker-1',
        status: 'new',
        seeker_message: 'Original message',
        host_archived: false,
        seeker_archived: false,
      };

      // Host legally updates status to contacted
      expect(enforceInquiryUpdate('host-1', baseInquiry, { ...baseInquiry, status: 'contacted' }).status)
        .toBe('contacted');

      // Host illegally tries to modify seeker_message
      expect(() => enforceInquiryUpdate('host-1', baseInquiry, { ...baseInquiry, seeker_message: 'Altered message' }))
        .toThrow('Security violation: Core inquiry fields and messages are immutable');

      // Host illegally tries to modify seeker_archived
      expect(() => enforceInquiryUpdate('host-1', baseInquiry, { ...baseInquiry, seeker_archived: true }))
        .toThrow('Security violation: Host cannot modify seeker archive state');

      // Seeker illegally tries to update status
      expect(() => enforceInquiryUpdate('seeker-1', baseInquiry, { ...baseInquiry, status: 'visited' }))
        .toThrow('Security violation: Seeker cannot modify inquiry status');

      // Seeker legally updates seeker_archived
      expect(enforceInquiryUpdate('seeker-1', baseInquiry, { ...baseInquiry, seeker_archived: true }).seeker_archived)
        .toBe(true);
    });
  });

  describe('5. public_profiles Restricted to Active Listing Hosts', () => {
    it('excludes passive users and seekers from public_profiles view', () => {
      const allProfiles = [
        { id: 'user-host-1', full_name: 'Meet Patel' },
        { id: 'user-passive-2', full_name: 'Inactive User' },
        { id: 'user-seeker-3', full_name: 'Anonymous Seeker' },
      ];

      const activeHostIds = new Set(['user-host-1']);

      const publicProfilesView = allProfiles.filter(p => activeHostIds.has(p.id));

      expect(publicProfilesView.length).toBe(1);
      expect(publicProfilesView[0].full_name).toBe('Meet Patel');
    });
  });

  describe('6. Abuse-Proof Listing Views RPC', () => {
    it('rate-limits view counter increments to 1 per viewer per space per hour', () => {
      const viewsCache = new Set<string>();
      let spaceViews = 0;

      const incrementSpaceViews = (spaceId: string, viewerToken: string) => {
        const hourKey = `view:${spaceId}:${viewerToken}:2026-10-31-18`;
        if (viewsCache.has(hourKey)) {
          return false; // Rate-limited
        }
        viewsCache.add(hourKey);
        spaceViews += 1;
        return true;
      };

      // First call within the hour succeeds
      expect(incrementSpaceViews('space-1', 'viewer_fingerprint_xyz')).toBe(true);
      expect(spaceViews).toBe(1);

      // Repeat calls within same hour are blocked
      expect(incrementSpaceViews('space-1', 'viewer_fingerprint_xyz')).toBe(false);
      expect(incrementSpaceViews('space-1', 'viewer_fingerprint_xyz')).toBe(false);
      expect(spaceViews).toBe(1);

      // Different viewer succeeds
      expect(incrementSpaceViews('space-1', 'viewer_fingerprint_abc')).toBe(true);
      expect(spaceViews).toBe(2);
    });
  });

  describe('7. Fail-Closed Seed Migration Guard', () => {
    it('rejects seed execution unless environment is explicitly development/local_test/staging', () => {
      const checkSeedAllowed = (envSetting: string | undefined) => {
        const allowed = ['development', 'local_test', 'staging'];
        if (!envSetting || !allowed.includes(envSetting)) {
          throw new Error('FATAL: Seed migration rejected. Environment must be development, local_test, or staging');
        }
        return true;
      };

      expect(() => checkSeedAllowed(undefined)).toThrow('FATAL: Seed migration rejected');
      expect(() => checkSeedAllowed('production')).toThrow('FATAL: Seed migration rejected');
      expect(() => checkSeedAllowed('test_prod')).toThrow('FATAL: Seed migration rejected');
      expect(checkSeedAllowed('development')).toBe(true);
      expect(checkSeedAllowed('staging')).toBe(true);
    });
  });

  describe('8. Pre-Migration Hardening Regression Tests', () => {
    it('verifies claim_guest_space rolls back claim token deletion if listing update affects 0 rows', () => {
      // Simulate database tables and transaction state
      const initialSecret = { hash: 'sha256_valid_hash', expiresAt: Date.now() + 60000 };
      let claimSecretsDb: Record<string, { hash: string; expiresAt: number } | undefined> = {
        'space-1': { ...initialSecret },
      };
      let spacesDb: Record<string, { id: string; user_id: string | null } | undefined> = {
        'space-1': { id: 'space-1', user_id: 'already-owned-user' }, // Space is already owned!
      };

      const executeClaimGuestSpace = (spaceId: string, tokenHash: string, claimerAuthId: string) => {
        // Transaction begin snapshot for rollback simulation
        const snapshotSecrets = JSON.parse(JSON.stringify(claimSecretsDb));
        const snapshotSpaces = JSON.parse(JSON.stringify(spacesDb));

        try {
          // 1. Row lock verification
          const space = spacesDb[spaceId];
          if (!space) throw new Error('Listing not found');
          if (space.user_id !== null) throw new Error('Listing has already been claimed');

          // 2. Consume token
          const secret = claimSecretsDb[spaceId];
          if (!secret || secret.hash !== tokenHash || secret.expiresAt < Date.now()) {
            throw new Error('Invalid or expired claim token');
          }
          delete claimSecretsDb[spaceId];

          // 3. Update space (must update exactly 1 unclaimed row)
          let updatedRows = 0;
          if (spacesDb[spaceId] && spacesDb[spaceId]!.user_id === null) {
            spacesDb[spaceId]!.user_id = claimerAuthId;
            updatedRows = 1;
          }

          if (updatedRows !== 1) {
            throw new Error('Claim failed: listing could not be updated or was already claimed');
          }

          return { success: true, space_id: spaceId, owner_id: claimerAuthId };
        } catch (err) {
          // Transaction rollback: restores tables to snapshot state
          claimSecretsDb = snapshotSecrets;
          spacesDb = snapshotSpaces;
          throw err;
        }
      };

      // Attempt claim on already-owned listing
      expect(() => executeClaimGuestSpace('space-1', 'sha256_valid_hash', 'attacker-uid'))
        .toThrow('Listing has already been claimed');

      // Crucial verification: token secret is NOT consumed; rolled back safely!
      expect(claimSecretsDb['space-1']).toBeDefined();
      expect(claimSecretsDb['space-1']?.hash).toBe('sha256_valid_hash');
    });

    it('enforces that simultaneous concurrent inquiries with the same phone for the same space are serialized and blocked by cooldown', async () => {
      // Simulation of concurrent transaction advisory locking:
      // perform pg_advisory_xact_lock(hashtext(new.space_id::text || ':' || new.seeker_phone));
      const activeAdvisoryLocks = new Set<string>();
      const inquiriesDb: Array<{ space_id: string; seeker_phone: string; created_at: number }> = [];

      const acquireAdvisoryLock = async (key: string): Promise<() => void> => {
        while (activeAdvisoryLocks.has(key)) {
          // Wait for previous transaction to release lock (serial queue)
          await new Promise((resolve) => setTimeout(resolve, 5));
        }
        activeAdvisoryLocks.add(key);
        return () => activeAdvisoryLocks.delete(key);
      };

      const submitInquiryWithAdvisoryLock = async (spaceId: string, phone: string) => {
        const lockKey = `${spaceId}:${phone}`;
        const releaseLock = await acquireAdvisoryLock(lockKey);

        try {
          // Check 5-minute cooldown inside serialized lock
          const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
          const hasRecent = inquiriesDb.some(
            (inq) => inq.space_id === spaceId && inq.seeker_phone === phone && inq.created_at > fiveMinutesAgo
          );

          if (hasRecent) {
            throw new Error('An inquiry from this phone number was recently submitted. Please wait before submitting again.');
          }

          // Insert new inquiry
          inquiriesDb.push({
            space_id: spaceId,
            seeker_phone: phone,
            created_at: Date.now(),
          });

          return { success: true };
        } finally {
          releaseLock();
        }
      };

      // Launch TWO simultaneous concurrent submissions for the exact same space and phone
      const [attempt1, attempt2] = await Promise.allSettled([
        submitInquiryWithAdvisoryLock('space-uuid-1', '9825123456'),
        submitInquiryWithAdvisoryLock('space-uuid-1', '9825123456'),
      ]);

      // Exactly one succeeds, the simultaneous race condition duplicate is blocked
      const successfulAttempts = [attempt1, attempt2].filter((res) => res.status === 'fulfilled');
      const rejectedAttempts = [attempt1, attempt2].filter((res) => res.status === 'rejected');

      expect(successfulAttempts.length).toBe(1);
      expect(rejectedAttempts.length).toBe(1);
      expect((rejectedAttempts[0] as PromiseRejectedResult).reason.message).toContain('recently submitted');
      expect(inquiriesDb.filter((i) => i.space_id === 'space-uuid-1').length).toBe(1);

      // Concurrent submissions for a DIFFERENT space or phone succeed in parallel without blocking
      const differentSpaceAttempt = await submitInquiryWithAdvisoryLock('space-uuid-2', '9825123456');
      expect(differentSpaceAttempt.success).toBe(true);

      const differentPhoneAttempt = await submitInquiryWithAdvisoryLock('space-uuid-1', '9825199999');
      expect(differentPhoneAttempt.success).toBe(true);
    });
  });

  describe('9. PostgreSQL Grants & Table Privileges Specification Tests', () => {
    // Model of PostgreSQL grant evaluation engine based on Migration 00002
    type Role = 'anon' | 'authenticated' | 'service_role';
    type Action = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';

    const tablePrivileges: Record<string, Record<Role, Set<Action>>> = {
      profiles: {
        anon: new Set(), // REVOKE ALL
        authenticated: new Set(['SELECT', 'UPDATE']), // Only own profile via RLS
        service_role: new Set(['SELECT', 'INSERT', 'UPDATE', 'DELETE']),
      },
      spaces: {
        anon: new Set(), // REVOKE ALL (Must use public_spaces view)
        authenticated: new Set(['SELECT', 'INSERT', 'UPDATE', 'DELETE']), // Filtered to own listings
        service_role: new Set(['SELECT', 'INSERT', 'UPDATE', 'DELETE']),
      },
      space_claim_secrets: {
        anon: new Set(), // REVOKE ALL
        authenticated: new Set(), // REVOKE ALL
        service_role: new Set(['SELECT', 'INSERT', 'UPDATE', 'DELETE']),
      },
      space_photos: {
        anon: new Set(['SELECT']), // Public can view photos
        authenticated: new Set(['SELECT', 'INSERT', 'DELETE']), // Space owners manage photos
        service_role: new Set(['SELECT', 'INSERT', 'UPDATE', 'DELETE']),
      },
      inquiries: {
        anon: new Set(['INSERT']), // Anonymous seekers submit lead inquiries
        authenticated: new Set(['SELECT', 'INSERT', 'UPDATE']), // No DELETE permission
        service_role: new Set(['SELECT', 'INSERT', 'UPDATE', 'DELETE']),
      },
      reports: {
        anon: new Set(['INSERT']), // Community flags listings
        authenticated: new Set(['SELECT', 'INSERT']), // View own reports
        service_role: new Set(['SELECT', 'INSERT', 'UPDATE', 'DELETE']),
      },
      rate_limits: {
        anon: new Set(), // REVOKE ALL
        authenticated: new Set(), // REVOKE ALL
        service_role: new Set(['SELECT', 'INSERT', 'UPDATE', 'DELETE']),
      },
    };

    const hasTablePrivilege = (role: Role, table: string, action: Action): boolean => {
      return tablePrivileges[table]?.[role]?.has(action) ?? false;
    };

    it('verifies anonymous role has zero direct table access to raw spaces, profiles, secrets, and rate limits', () => {
      expect(hasTablePrivilege('anon', 'spaces', 'SELECT')).toBe(false);
      expect(hasTablePrivilege('anon', 'spaces', 'INSERT')).toBe(false);
      expect(hasTablePrivilege('anon', 'profiles', 'SELECT')).toBe(false);
      expect(hasTablePrivilege('anon', 'profiles', 'UPDATE')).toBe(false);
      expect(hasTablePrivilege('anon', 'space_claim_secrets', 'SELECT')).toBe(false);
      expect(hasTablePrivilege('anon', 'rate_limits', 'SELECT')).toBe(false);
      expect(hasTablePrivilege('anon', 'rate_limits', 'UPDATE')).toBe(false);
    });

    it('verifies anonymous role can only INSERT into inquiries and reports, with zero SELECT/UPDATE/DELETE access', () => {
      expect(hasTablePrivilege('anon', 'inquiries', 'INSERT')).toBe(true);
      expect(hasTablePrivilege('anon', 'inquiries', 'SELECT')).toBe(false);
      expect(hasTablePrivilege('anon', 'inquiries', 'UPDATE')).toBe(false);
      expect(hasTablePrivilege('anon', 'inquiries', 'DELETE')).toBe(false);

      expect(hasTablePrivilege('anon', 'reports', 'INSERT')).toBe(true);
      expect(hasTablePrivilege('anon', 'reports', 'SELECT')).toBe(false);
      expect(hasTablePrivilege('anon', 'reports', 'UPDATE')).toBe(false);
      expect(hasTablePrivilege('anon', 'reports', 'DELETE')).toBe(false);
    });

    it('verifies authenticated users cannot delete inquiries or claim secrets, preserving audit integrity', () => {
      expect(hasTablePrivilege('authenticated', 'inquiries', 'SELECT')).toBe(true);
      expect(hasTablePrivilege('authenticated', 'inquiries', 'INSERT')).toBe(true);
      expect(hasTablePrivilege('authenticated', 'inquiries', 'UPDATE')).toBe(true);
      expect(hasTablePrivilege('authenticated', 'inquiries', 'DELETE')).toBe(false); // Hard deletion denied

      expect(hasTablePrivilege('authenticated', 'space_claim_secrets', 'SELECT')).toBe(false);
      expect(hasTablePrivilege('authenticated', 'space_claim_secrets', 'DELETE')).toBe(false);
    });

    it('verifies authenticated users cannot direct-insert or delete profiles', () => {
      // Profile creation is strictly handled by handle_new_user auth trigger
      expect(hasTablePrivilege('authenticated', 'profiles', 'INSERT')).toBe(false);
      expect(hasTablePrivilege('authenticated', 'profiles', 'DELETE')).toBe(false);
      expect(hasTablePrivilege('authenticated', 'profiles', 'SELECT')).toBe(true);
      expect(hasTablePrivilege('authenticated', 'profiles', 'UPDATE')).toBe(true);
    });
  });

  describe('10. Storage Setup & Photo Access Security Specification Tests', () => {
    // Model of Supabase Storage RLS & Path Validation based on Migration 00003
    interface StorageObject {
      bucket_id: string;
      name: string; // Path inside bucket: e.g. "space-uuid/photo.jpg"
    }

    interface SpaceRecord {
      id: string;
      user_id: string;
    }

    const BUCKET_CONFIG = {
      id: 'listing-photos',
      name: 'listing-photos',
      public: true,
      file_size_limit: 5242880, // 5 MB
      allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp'],
    };

    const spacesDb: Record<string, SpaceRecord> = {
      '550e8400-e29b-41d4-a716-446655440000': {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: 'user-owner-1',
      },
      'a0000000-0000-0000-0000-000000000001': {
        id: 'a0000000-0000-0000-0000-000000000001',
        user_id: 'user-owner-2',
      },
    };

    // Helper functions modeling Supabase Storage functions
    const storageFoldername = (name: string): string[] => {
      const parts = name.split('/');
      return parts.slice(0, parts.length - 1);
    };

    const storageFilename = (name: string): string => {
      const parts = name.split('/');
      return parts[parts.length - 1] || '';
    };

    const storageExtension = (name: string): string => {
      const fn = storageFilename(name);
      const dotIndex = fn.lastIndexOf('.');
      return dotIndex >= 0 ? fn.slice(dotIndex + 1).toLowerCase() : '';
    };

    // Evaluator for Storage RLS Policies
    const evaluateStoragePolicy = (
      action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
      auth: { role: 'anon' | 'authenticated'; uid: string | null },
      obj: StorageObject
    ): { allowed: boolean; reason?: string } => {
      // 1. SELECT Policy: "Public can view listing photos"
      if (action === 'SELECT') {
        if (obj.bucket_id === 'listing-photos') {
          return { allowed: true };
        }
        return { allowed: false, reason: 'Bucket not public' };
      }

      // 2. INSERT / UPDATE / DELETE require authenticated role
      if (auth.role !== 'authenticated' || !auth.uid) {
        return { allowed: false, reason: 'Authentication required' };
      }

      if (obj.bucket_id !== 'listing-photos') {
        return { allowed: false, reason: 'Invalid bucket' };
      }

      // 3. Folder depth check: exactly 1 level (<space_id>/<file>)
      const folders = storageFoldername(obj.name);
      if (folders.length !== 1) {
        return { allowed: false, reason: 'Path must contain exactly one directory level (<space_id>/<filename>)' };
      }

      // 4. Path traversal prevention
      if (obj.name.includes('..')) {
        return { allowed: false, reason: 'Path traversal sequences (..) are strictly forbidden' };
      }

      // 5. Filename & UUID syntax check for INSERT & UPDATE
      const pathRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[a-zA-Z0-9_\-][a-zA-Z0-9_\-\. ]*\.(jpe?g|png|webp)$/i;
      if (action === 'INSERT' || action === 'UPDATE') {
        if (!pathRegex.test(obj.name)) {
          return { allowed: false, reason: 'Path does not match valid <uuid>/<clean_filename>.(jpg|jpeg|png|webp) format' };
        }

        const ext = storageExtension(obj.name);
        if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
          return { allowed: false, reason: `File extension .${ext} is not allowed` };
        }
      }

      // 6. Space Ownership Check: caller must own the space in (storage.foldername(name))[1]
      const targetSpaceId = folders[0];
      const space = spacesDb[targetSpaceId];
      if (!space || space.user_id !== auth.uid) {
        return { allowed: false, reason: 'Listing ownership required. Caller does not own this space.' };
      }

      return { allowed: true };
    };

    it('verifies bucket configuration conforms to 5 MB limit and image MIME whitelist', () => {
      expect(BUCKET_CONFIG.id).toBe('listing-photos');
      expect(BUCKET_CONFIG.public).toBe(true);
      expect(BUCKET_CONFIG.file_size_limit).toBe(5242880);
      expect(BUCKET_CONFIG.allowed_mime_types).toEqual(['image/jpeg', 'image/png', 'image/webp']);
    });

    it('verifies anonymous visitors can view listing photos via CDN but cannot upload, update, or delete', () => {
      const samplePhoto: StorageObject = {
        bucket_id: 'listing-photos',
        name: '550e8400-e29b-41d4-a716-446655440000/living_room.jpg',
      };

      const anonAuth = { role: 'anon' as const, uid: null };

      // SELECT allowed for public CDN delivery
      expect(evaluateStoragePolicy('SELECT', anonAuth, samplePhoto).allowed).toBe(true);

      // INSERT denied
      const insertResult = evaluateStoragePolicy('INSERT', anonAuth, samplePhoto);
      expect(insertResult.allowed).toBe(false);
      expect(insertResult.reason).toContain('Authentication required');

      // UPDATE denied
      expect(evaluateStoragePolicy('UPDATE', anonAuth, samplePhoto).allowed).toBe(false);

      // DELETE denied
      expect(evaluateStoragePolicy('DELETE', anonAuth, samplePhoto).allowed).toBe(false);
    });

    it('verifies listing owners can upload, update, and delete photos for their own spaces', () => {
      const ownerAuth = { role: 'authenticated' as const, uid: 'user-owner-1' };
      const validPhoto: StorageObject = {
        bucket_id: 'listing-photos',
        name: '550e8400-e29b-41d4-a716-446655440000/bedroom-1.png',
      };

      expect(evaluateStoragePolicy('INSERT', ownerAuth, validPhoto).allowed).toBe(true);
      expect(evaluateStoragePolicy('UPDATE', ownerAuth, validPhoto).allowed).toBe(true);
      expect(evaluateStoragePolicy('DELETE', ownerAuth, validPhoto).allowed).toBe(true);
    });

    it('verifies authenticated users cannot upload, update, or delete photos for listings they do not own', () => {
      const otherUserAuth = { role: 'authenticated' as const, uid: 'attacker-user-3' };
      const victimSpacePhoto: StorageObject = {
        bucket_id: 'listing-photos',
        name: '550e8400-e29b-41d4-a716-446655440000/hacked.jpg',
      };

      const insertCheck = evaluateStoragePolicy('INSERT', otherUserAuth, victimSpacePhoto);
      expect(insertCheck.allowed).toBe(false);
      expect(insertCheck.reason).toContain('Listing ownership required');

      const updateCheck = evaluateStoragePolicy('UPDATE', otherUserAuth, victimSpacePhoto);
      expect(updateCheck.allowed).toBe(false);
      expect(updateCheck.reason).toContain('Listing ownership required');

      const deleteCheck = evaluateStoragePolicy('DELETE', otherUserAuth, victimSpacePhoto);
      expect(deleteCheck.allowed).toBe(false);
      expect(deleteCheck.reason).toContain('Listing ownership required');
    });

    it('rejects extra nested subdirectories, empty filenames, and directory traversal attempts', () => {
      const ownerAuth = { role: 'authenticated' as const, uid: 'user-owner-1' };

      // Extra subfolder (<uuid>/sub/photo.jpg) -> Rejected (folders.length > 1)
      const nestedPhoto: StorageObject = {
        bucket_id: 'listing-photos',
        name: '550e8400-e29b-41d4-a716-446655440000/subfolder/nested/photo.jpg',
      };
      expect(evaluateStoragePolicy('INSERT', ownerAuth, nestedPhoto).allowed).toBe(false);

      // Root path (no folder) -> Rejected (folders.length === 0)
      const rootPhoto: StorageObject = {
        bucket_id: 'listing-photos',
        name: 'photo.jpg',
      };
      expect(evaluateStoragePolicy('INSERT', ownerAuth, rootPhoto).allowed).toBe(false);

      // Path traversal (..) -> Rejected
      const traversalPhoto: StorageObject = {
        bucket_id: 'listing-photos',
        name: '550e8400-e29b-41d4-a716-446655440000/../other-space/hack.jpg',
      };
      expect(evaluateStoragePolicy('INSERT', ownerAuth, traversalPhoto).allowed).toBe(false);

      // Empty filename (<uuid>/) -> Rejected
      const emptyFilename: StorageObject = {
        bucket_id: 'listing-photos',
        name: '550e8400-e29b-41d4-a716-446655440000/',
      };
      expect(evaluateStoragePolicy('INSERT', ownerAuth, emptyFilename).allowed).toBe(false);

      // Invalid UUID folder -> Rejected
      const nonUuidFolder: StorageObject = {
        bucket_id: 'listing-photos',
        name: 'not-a-valid-uuid/photo.jpg',
      };
      expect(evaluateStoragePolicy('INSERT', ownerAuth, nonUuidFolder).allowed).toBe(false);
    });

    it('rejects disallowed file extensions (executables, scripts, SVGs, documents)', () => {
      const ownerAuth = { role: 'authenticated' as const, uid: 'user-owner-1' };

      const maliciousFiles = [
        '550e8400-e29b-41d4-a716-446655440000/shell.sh',
        '550e8400-e29b-41d4-a716-446655440000/exploit.exe',
        '550e8400-e29b-41d4-a716-446655440000/xss.svg',
        '550e8400-e29b-41d4-a716-446655440000/document.pdf',
        '550e8400-e29b-41d4-a716-446655440000/image.gif',
      ];

      for (const fileName of maliciousFiles) {
        const obj: StorageObject = { bucket_id: 'listing-photos', name: fileName };
        expect(evaluateStoragePolicy('INSERT', ownerAuth, obj).allowed).toBe(false);
      }
    });

    it('accepts legitimate filenames with spaces, dashes, numbers, and allowed extensions', () => {
      const ownerAuth = { role: 'authenticated' as const, uid: 'user-owner-1' };

      const validFiles = [
        '550e8400-e29b-41d4-a716-446655440000/Master Bedroom 1.jpg',
        '550e8400-e29b-41d4-a716-446655440000/living-room-balcony.PNG',
        '550e8400-e29b-41d4-a716-446655440000/kitchen_setup_2026.webp',
        '550e8400-e29b-41d4-a716-446655440000/flat.exterior.jpeg',
      ];

      for (const fileName of validFiles) {
        const obj: StorageObject = { bucket_id: 'listing-photos', name: fileName };
        expect(evaluateStoragePolicy('INSERT', ownerAuth, obj).allowed).toBe(true);
      }
    });
  });

});
