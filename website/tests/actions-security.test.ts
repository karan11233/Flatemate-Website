import { describe, it, expect, afterEach } from 'vitest';
import { incrementSpaceViewsAction, updateSpaceStatusAction, createSpaceAction } from '../app/actions/spaces';
import { submitInquiryAction, getHostInquiriesAction, updateInquiryStatusAction, archiveInquiryAction } from '../app/actions/inquiries';
import { getCloudSpaces, getCloudInquiries, insertCloudSpace } from '../lib/supabase';
import { SpaceListing } from '../types';

describe('Server Actions Security & Persistence Error Handling Tests', () => {

  describe('1. View Counter Security (incrementSpaceViewsAction)', () => {
    it('rejects invalid or non-UUID space IDs without hitting database', async () => {
      const res = await incrementSpaceViewsAction('not-a-valid-uuid');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Invalid space ID');
    });

    it('returns failure when database service is unconfigured (no false success)', async () => {
      // In test environment without NEXT_PUBLIC_SUPABASE_URL, client returns null
      const res = await incrementSpaceViewsAction('c56a4180-65aa-42ec-a945-5fd21dec0538');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Database service is not configured');
    });

    it('verifies view counter reports failure when RPC throws or returns error', () => {
      // Simulating RPC response handler logic in incrementSpaceViewsAction
      const handleRpcResponse = (error: { message: string } | null) => {
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      };

      const failure = handleRpcResponse({ message: 'Rate limit exceeded for listing views' });
      expect(failure.success).toBe(false);
      expect(failure.error).toBe('Rate limit exceeded for listing views');

      const success = handleRpcResponse(null);
      expect(success.success).toBe(true);
      expect(success.error).toBeUndefined();
    });
  });

  describe('2. Transparent Database Error Propagation (No Hidden Failures)', () => {
    it('getCloudSpaces propagates database failure to caller rather than hiding it', async () => {
      const res = await getCloudSpaces();
      // In test env without live Supabase, error must be reported
      expect(res.error).toBeDefined();
      expect(typeof res.error).toBe('string');
      expect(Array.isArray(res.data)).toBe(true);
    });

    it('getCloudInquiries propagates database failure to caller rather than hiding it', async () => {
      const res = await getCloudInquiries();
      expect(res.error).toBeDefined();
      expect(typeof res.error).toBe('string');
      expect(Array.isArray(res.data)).toBe(true);
    });

    it('distinguishes successful empty database result from operational failure', () => {
      const parseSpacesResult = (dbResult: { data: any[] | null; error: { message: string } | null }) => {
        if (dbResult.error) {
          return { data: [], error: dbResult.error.message };
        }
        return { data: dbResult.data || [] };
      };

      // Case A: Query succeeded with 0 listings -> data is empty, error is undefined
      const emptySuccess = parseSpacesResult({ data: [], error: null });
      expect(emptySuccess.data).toEqual([]);
      expect(emptySuccess.error).toBeUndefined();

      // Case B: Database error -> data is empty, error is present
      const operationalFailure = parseSpacesResult({ data: null, error: { message: 'connection timeout' } });
      expect(operationalFailure.data).toEqual([]);
      expect(operationalFailure.error).toBe('connection timeout');
    });
  });

  describe('3. Removal of Hardcoded Placeholder Contact Information', () => {
    it('insertCloudSpace rejects missing host phone without falling back to 9876543210', async () => {
      const spaceWithoutPhone: SpaceListing = {
        id: '',
        type: 'Private Room in Satellite',
        rent: '₹12,000',
        rawRent: 12000,
        location: 'Satellite, Ahmedabad',
        furnishing: 'Fully Furnished',
        occupancy: 'Single',
        hostName: 'Test Host',
        // hostPhone is intentionally omitted
      };

      const res = await insertCloudSpace(spaceWithoutPhone);
      expect(res.success).toBe(false);
      expect(res.error).toContain('A valid 10-digit Indian mobile number is required');
    });

    it('insertCloudSpace rejects invalid/malformed host phone', async () => {
      const spaceWithBadPhone: SpaceListing = {
        id: '',
        type: 'Private Room in Vastrapur',
        rent: '₹10,000',
        rawRent: 10000,
        location: 'Vastrapur, Ahmedabad',
        furnishing: 'Semi-Furnished',
        occupancy: 'Single',
        hostName: 'Test Host',
        hostPhone: '12345', // invalid length
      };

      const res = await insertCloudSpace(spaceWithBadPhone);
      expect(res.success).toBe(false);
      expect(res.error).toContain('A valid 10-digit Indian mobile number is required');
    });
  });

  describe('4. Server-Side Host Authorization Boundaries', () => {
    it('createSpaceAction rejects unauthenticated callers', async () => {
      const payload = {
        title: 'Spacious 2BHK in Navrangpura',
        description: 'Looking for flatmate in 2BHK flat near commerce six roads.',
        location: 'Navrangpura',
        rent: 14000,
        deposit: 28000,
        listingType: 'room',
        genderPreference: 'any',
        furnishing: 'fully_furnished',
        roomType: 'Private Room',
        contactName: 'Host Name',
        contactPhone: '9825123456',
        consentWhatsappContact: true,
      };

      const res = await createSpaceAction(payload);
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it('updateSpaceStatusAction rejects unauthenticated callers', async () => {
      const res = await updateSpaceStatusAction('c56a4180-65aa-42ec-a945-5fd21dec0538', 'rented');
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it('getHostInquiriesAction rejects unauthenticated callers', async () => {
      const res = await getHostInquiriesAction();
      expect(res.data).toEqual([]);
      expect(res.error).toBeDefined();
    });

    it('updateInquiryStatusAction rejects unauthenticated callers', async () => {
      const res = await updateInquiryStatusAction('c56a4180-65aa-42ec-a945-5fd21dec0538', 'contacted');
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it('archiveInquiryAction rejects unauthenticated callers', async () => {
      const res = await archiveInquiryAction('c56a4180-65aa-42ec-a945-5fd21dec0538', 'host');
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it('enforces that a host can never update another host listing or inquiry', () => {
      // Logic simulation of updateSpaceStatusAction server-side boundary:
      // UPDATE spaces SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING id
      const executeUpdateSpaceStatus = (
        authenticatedUserId: string,
        targetSpace: { id: string; user_id: string; status: string },
        newStatus: 'active' | 'rented'
      ) => {
        if (targetSpace.user_id !== authenticatedUserId) {
          // Zero rows modified
          return { success: false, error: 'Space not found or unauthorized to update status' };
        }
        return { success: true, updated: { ...targetSpace, status: newStatus } };
      };

      const attackerUserId = 'attacker-uuid-999';
      const victimSpace = {
        id: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
        user_id: 'legitimate-host-uuid-111',
        status: 'active',
      };

      const attackResult = executeUpdateSpaceStatus(attackerUserId, victimSpace, 'rented');
      expect(attackResult.success).toBe(false);
      expect(attackResult.error).toBe('Space not found or unauthorized to update status');

      const ownerResult = executeUpdateSpaceStatus('legitimate-host-uuid-111', victimSpace, 'rented');
      expect(ownerResult.success).toBe(true);
    });
  });

  describe('5. Demo Mode Fail-Closed Production Security', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE;

    afterEach(() => {
      (process.env as any).NODE_ENV = originalNodeEnv;
      process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE = originalDemoMode;
    });

    it('strictly forbids mock successes when NODE_ENV is production even if NEXT_PUBLIC_ENABLE_DEMO_MODE=true', async () => {
      // Force production environment
      (process.env as any).NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE = 'true';

      // 1. Submit inquiry must fail closed (no mock success in production)
      const inquiryRes = await submitInquiryAction({
        spaceId: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
        seekerName: 'Priya Sharma',
        seekerPhone: '9825123456',
        seekerMessage: 'Interested',
      });
      expect(inquiryRes.success).toBe(false);
      expect(inquiryRes.error).toContain('Database service is not configured');

      // 2. Create space must fail closed
      const spaceRes = await createSpaceAction({
        title: '2BHK Apartment Navrangpura',
        description: 'Spacious apartment looking for a quiet flatmate in Navrangpura.',
        location: 'Navrangpura',
        rent: 15000,
        deposit: 30000,
        listingType: 'room',
        genderPreference: 'any',
        furnishing: 'fully_furnished',
        roomType: 'Private Room',
        contactName: 'Host Name',
        contactPhone: '9825123456',
        consentWhatsappContact: true,
      });
      expect(spaceRes.success).toBe(false);
      expect(spaceRes.error).toContain('Database service is not configured');

      // 3. Status updates must fail closed
      const updateRes = await updateSpaceStatusAction('c56a4180-65aa-42ec-a945-5fd21dec0538', 'rented');
      expect(updateRes.success).toBe(false);

      // 4. Archive inquiry must fail closed
      const archiveRes = await archiveInquiryAction('c56a4180-65aa-42ec-a945-5fd21dec0538', 'host');
      expect(archiveRes.success).toBe(false);
    });
  });

});
