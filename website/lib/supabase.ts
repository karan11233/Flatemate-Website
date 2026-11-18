import { SpaceListing, AuthUser } from '../types';
import { Inquiry } from '../components/MyListingsModal';
import { INITIAL_MOCK_SPACES, INITIAL_MOCK_INQUIRIES } from '../data/mockData';
import { getPublicSpacesAction, createSpaceAction, updateSpaceStatusAction } from '@/app/actions/spaces';
import { submitInquiryAction, getHostInquiriesAction, updateInquiryStatusAction } from '@/app/actions/inquiries';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = typeof window !== 'undefined' ? getSupabaseBrowserClient() : null;

/**
 * Get or create a persistent anonymous device client ID (Used for UI session state, never as proof of authentication)
 */
export function getOrCreateDeviceUserId(): string {
  if (typeof window === 'undefined') return 'usr_server';
  try {
    let id = localStorage.getItem('flatemate_device_user_id');
    if (!id) {
      id = 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem('flatemate_device_user_id', id);
    }
    return id;
  } catch {
    return 'usr_' + Date.now().toString(36);
  }
}

/**
 * Genuine Supabase Auth Sign Up
 */
export async function signUpUser({
  email,
  password,
  fullName,
  phone,
}: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}): Promise<{ user: AuthUser | null; error: string | null; needsEmailVerification?: boolean }> {
  const isDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true';
  const client = getSupabaseBrowserClient();

  if (!client) {
    if (isDemoMode) {
      const mockUser: AuthUser = {
        id: `mock-${Date.now()}`,
        email: email.trim().toLowerCase(),
        phone: phone.trim().slice(-10),
        fullName: fullName.trim(),
      };
      return { user: mockUser, error: null };
    }
    return { user: null, error: 'Authentication service is not configured' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim().slice(-10);
  const cleanName = fullName.trim();

  const { data, error } = await client.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        full_name: cleanName,
        phone: cleanPhone,
      },
    },
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (data.user) {
    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email || cleanEmail,
      phone: data.user.user_metadata?.phone || cleanPhone,
      fullName: data.user.user_metadata?.full_name || cleanName,
    };
    // If Supabase requires email verification, session will be null
    const needsEmailVerification = !data.session;
    return { user: authUser, error: null, needsEmailVerification };
  }

  return { user: null, error: 'Registration failed. Please try again.' };
}

/**
 * Genuine Supabase Auth Sign In
 */
export async function signInUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ user: AuthUser | null; error: string | null }> {
  const isDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true';
  const client = getSupabaseBrowserClient();

  if (!client) {
    if (isDemoMode) {
      const mockUser: AuthUser = {
        id: `mock-${Date.now()}`,
        email: email.trim().toLowerCase(),
        phone: '',
        fullName: email.split('@')[0],
      };
      return { user: mockUser, error: null };
    }
    return { user: null, error: 'Authentication service is not configured' };
  }

  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (data.user) {
    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      phone: data.user.user_metadata?.phone || '',
      fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
    };
    return { user: authUser, error: null };
  }

  return { user: null, error: 'Failed to sign in. Please verify your credentials.' };
}

/**
 * Genuine Supabase Auth Sign Out
 */
export async function signOutUser(): Promise<void> {
  const client = getSupabaseBrowserClient();
  if (client) {
    await client.auth.signOut();
  }
}

/**
 * Get current session user from genuine Supabase Auth
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      phone: user.user_metadata?.phone || '',
      fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    };
  } catch {
    return null;
  }
}

/**
 * Fetch spaces (Server Action with transparent error reporting)
 */
export async function getCloudSpaces(): Promise<{ data: SpaceListing[]; error?: string }> {
  const isDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true';
  try {
    const res = await getPublicSpacesAction();
    if (res.error) {
      if (isDemoMode) {
        return { data: INITIAL_MOCK_SPACES, error: res.error };
      }
      return { data: [], error: res.error };
    }
    return { data: res.data || [] };
  } catch (err: any) {
    const errMsg = err?.message || 'Failed to retrieve spaces';
    if (isDemoMode) {
      return { data: INITIAL_MOCK_SPACES, error: errMsg };
    }
    return { data: [], error: errMsg };
  }
}

/**
 * Insert a space (Server Action with confirmed database persistence)
 */
export async function insertCloudSpace(
  space: SpaceListing
): Promise<{ success: boolean; id?: string; error?: string }> {
  const cleanPhone = (space.hostPhone || '').replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    return { success: false, error: 'A valid 10-digit Indian mobile number is required to list a space.' };
  }

  try {
    const res = await createSpaceAction({
      title: space.type,
      description: space.description || `${space.type} in ${space.location}`,
      location: space.location.split(',')[0].trim(),
      rent: space.rawRent,
      deposit: space.rawRent * 2,
      listingType: space.category === 'seeker' ? 'seeking_flat' : space.category === 'replacement' ? 'room' : 'entire_flat',
      genderPreference: 'any',
      furnishing: space.furnishing?.toLowerCase().includes('fully') ? 'fully_furnished' : 'semi_furnished',
      roomType: space.occupancy || 'Private Room',
      amenities: space.amenities || [],
      images: space.image ? [space.image] : [],
      contactName: space.hostName || 'Host',
      contactPhone: cleanPhone,
      consentWhatsappContact: false, // Default opt-in: false
    });
    return res;
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error creating space' };
  }
}

/**
 * Update space status (Server Action with confirmed database persistence)
 */
export async function updateCloudSpaceStatus(
  spaceId: string,
  status: 'active' | 'rented'
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await updateSpaceStatusAction(spaceId, status);
    return res;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update space status' };
  }
}

/**
 * Fetch inquiries (Server Action with transparent error reporting)
 */
export async function getCloudInquiries(): Promise<{ data: Inquiry[]; error?: string }> {
  const isDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true';
  try {
    const res = await getHostInquiriesAction();
    if (res.error) {
      if (isDemoMode) {
        return { data: INITIAL_MOCK_INQUIRIES, error: res.error };
      }
      return { data: [], error: res.error };
    }
    return { data: (res.data as any) || [] };
  } catch (err: any) {
    const errMsg = err?.message || 'Failed to retrieve inquiries';
    if (isDemoMode) {
      return { data: INITIAL_MOCK_INQUIRIES, error: errMsg };
    }
    return { data: [], error: errMsg };
  }
}

/**
 * Insert inquiry (Server Action with confirmed database persistence)
 */
export async function insertCloudInquiry(
  inquiry: Inquiry
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const res = await submitInquiryAction({
      spaceId: inquiry.spaceId,
      seekerName: inquiry.seekerName,
      seekerPhone: inquiry.seekerPhone,
      seekerMessage: inquiry.note,
      moveInDate: inquiry.moveInDate,
    });
    return res;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit inquiry' };
  }
}

/**
 * Update inquiry status (Server Action with confirmed database persistence)
 */
export async function updateCloudInquiryStatus(
  inquiryId: string,
  status: 'new' | 'contacted' | 'visited'
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await updateInquiryStatusAction(inquiryId, status);
    return res;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update inquiry status' };
  }
}
