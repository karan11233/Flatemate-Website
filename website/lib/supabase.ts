import { SpaceListing, AuthUser } from '../types';
import { Inquiry } from '../components/MyListingsModal';
import { INITIAL_MOCK_SPACES, INITIAL_MOCK_INQUIRIES } from '../data/mockData';
import { getPublicSpacesAction, createSpaceAction, updateSpaceStatusAction } from '@/app/actions/spaces';
import { submitInquiryAction, getHostInquiriesAction, updateInquiryStatusAction } from '@/app/actions/inquiries';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: any = null;

/**
 * Get or create a persistent anonymous device user ID
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
 * Normalize login identifier (email or 10-digit Indian mobile)
 */
export function normalizeAuthEmail(identifier: string): string {
  const clean = identifier.trim();
  if (clean.includes('@')) {
    return clean.toLowerCase();
  }
  const digits = clean.replace(/\D/g, '');
  return `${digits}@flatemate.app`;
}

/**
 * Sign up a user (Local & Supabase Auth Bridge)
 */
export async function signUpUser({
  emailOrPhone,
  password,
  fullName,
  phone,
}: {
  emailOrPhone: string;
  password: string;
  fullName: string;
  phone: string;
}): Promise<{ user: AuthUser | null; error: string | null }> {
  const cleanPhone = phone.trim().slice(-10);
  const user: AuthUser = {
    id: `usr_${Date.now()}`,
    email: normalizeAuthEmail(emailOrPhone || phone),
    phone: cleanPhone,
    fullName: fullName.trim(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('flatemate_user', JSON.stringify(user));
    localStorage.setItem('flatemate_user_name', user.fullName || '');
    localStorage.setItem('flatemate_user_phone', user.phone || '');
  }

  return { user, error: null };
}

/**
 * Sign in a user
 */
export async function signInUser({
  emailOrPhone,
  password,
}: {
  emailOrPhone: string;
  password: string;
}): Promise<{ user: AuthUser | null; error: string | null }> {
  const cleanPhone = emailOrPhone.replace(/\D/g, '').slice(-10);
  const user: AuthUser = {
    id: `usr_${Date.now()}`,
    email: emailOrPhone.includes('@') ? emailOrPhone.trim() : `${cleanPhone}@flatemate.app`,
    phone: cleanPhone.length === 10 ? cleanPhone : '',
    fullName: emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : 'Host Member',
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('flatemate_user', JSON.stringify(user));
    if (user.fullName) localStorage.setItem('flatemate_user_name', user.fullName);
    if (user.phone) localStorage.setItem('flatemate_user_phone', user.phone);
  }

  return { user, error: null };
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('flatemate_user');
    localStorage.removeItem('flatemate_user_name');
    localStorage.removeItem('flatemate_user_phone');
  }
}

/**
 * Get current session user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('flatemate_user');
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

/**
 * Fetch spaces (Server Action with local fallback)
 */
export async function getCloudSpaces(): Promise<SpaceListing[] | null> {
  try {
    const res = await getPublicSpacesAction();
    if (res.data && res.data.length > 0) {
      return res.data;
    }
  } catch {}

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('flatemate_spaces_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }
  return INITIAL_MOCK_SPACES;
}

/**
 * Insert a space (Server Action with local fallback)
 */
export async function insertCloudSpace(space: SpaceListing): Promise<boolean> {
  try {
    if (isSupabaseConfigured) {
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
        contactPhone: space.hostPhone || '9876543210',
        consentWhatsappContact: false, // Default opt-in: false
      });
      if (res.success) return true;
    }
  } catch {}

  // Local fallback
  if (typeof window !== 'undefined') {
    try {
      const current = await getCloudSpaces() || [];
      const updated = [space, ...current];
      localStorage.setItem('flatemate_spaces_data', JSON.stringify(updated));
      return true;
    } catch {}
  }
  return true;
}

/**
 * Update space status
 */
export async function updateCloudSpaceStatus(
  spaceId: string,
  status: 'active' | 'rented'
): Promise<boolean> {
  try {
    if (isSupabaseConfigured) {
      await updateSpaceStatusAction(spaceId, status);
      return true;
    }
  } catch {}

  if (typeof window !== 'undefined') {
    try {
      const current = await getCloudSpaces() || [];
      const updated = current.map((s) => (s.id === spaceId ? { ...s, status } : s));
      localStorage.setItem('flatemate_spaces_data', JSON.stringify(updated));
      return true;
    } catch {}
  }
  return true;
}

/**
 * Fetch inquiries (Server Action with local fallback)
 */
export async function getCloudInquiries(): Promise<Inquiry[] | null> {
  try {
    if (isSupabaseConfigured) {
      const res = await getHostInquiriesAction();
      if (res.data) return res.data as any;
    }
  } catch {}

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('flatemate_inquiries_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }
  return INITIAL_MOCK_INQUIRIES;
}

/**
 * Insert inquiry (Server Action with local fallback)
 */
export async function insertCloudInquiry(inquiry: Inquiry): Promise<boolean> {
  try {
    if (isSupabaseConfigured) {
      const res = await submitInquiryAction({
        spaceId: inquiry.spaceId,
        seekerName: inquiry.seekerName,
        seekerPhone: inquiry.seekerPhone,
        seekerMessage: inquiry.note,
        moveInDate: inquiry.moveInDate,
      });
      if (res.success) return true;
    }
  } catch {}

  if (typeof window !== 'undefined') {
    try {
      const current = await getCloudInquiries() || [];
      const updated = [inquiry, ...current];
      localStorage.setItem('flatemate_inquiries_data', JSON.stringify(updated));
      return true;
    } catch {}
  }
  return true;
}

/**
 * Update inquiry status
 */
export async function updateCloudInquiryStatus(
  inquiryId: string,
  status: 'new' | 'contacted' | 'visited'
): Promise<boolean> {
  try {
    if (isSupabaseConfigured) {
      await updateInquiryStatusAction(inquiryId, status);
      return true;
    }
  } catch {}

  if (typeof window !== 'undefined') {
    try {
      const current = await getCloudInquiries() || [];
      const updated = current.map((i) => (i.id === inquiryId ? { ...i, status: status as any } : i));
      localStorage.setItem('flatemate_inquiries_data', JSON.stringify(updated));
      return true;
    } catch {}
  }
  return true;
}
