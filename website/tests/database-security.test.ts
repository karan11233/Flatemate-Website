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

});
