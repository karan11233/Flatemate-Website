import { createClient } from '@supabase/supabase-js';
import { SpaceListing, AuthUser } from '../types';
import { Inquiry } from '../components/MyListingsModal';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upckzykqjnugdyvlynvq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2mIgBkhS4iCoEZNxfQdidA_6W1q0b_N';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Get or create a persistent anonymous device user ID
 * Guarantees every user has a unique ID without requiring passwords or emails.
 */
export function getOrCreateDeviceUserId(): string {
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
 * Helper to normalize login identifier (email or 10-digit Indian mobile)
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
 * Sign up a new user with full name, mobile, and password
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
  if (!supabase) return { user: null, error: 'Supabase cloud is not configured' };

  try {
    const email = normalizeAuthEmail(emailOrPhone || phone);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        return { 
          user: null, 
          error: 'Supabase email rate limit reached (max 3-4 emails/hr). Please turn OFF "Confirm email" in your Supabase Auth settings to allow unlimited instant signups.' 
        };
      }
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Registration failed. Please try again.' };
    }

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      phone: phone.trim(),
      fullName: fullName.trim(),
    };

    return { user: authUser, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Network error during registration' };
  }
}

/**
 * Sign in an existing user with Email or Mobile + Password
 */
export async function signInUser({
  emailOrPhone,
  password,
}: {
  emailOrPhone: string;
  password: string;
}): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!supabase) return { user: null, error: 'Supabase cloud is not configured' };

  try {
    const email = normalizeAuthEmail(emailOrPhone);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        return { 
          user: null, 
          error: 'Supabase email rate limit reached (max 3-4 emails/hr). Please turn OFF "Confirm email" in your Supabase Auth settings to allow unlimited instant signups.' 
        };
      }
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Login failed. Please check credentials.' };
    }

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      phone: data.user.user_metadata?.phone || '',
      fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
    };

    return { user: authUser, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Network error during login' };
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Get current session user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    const u = session.user;
    return {
      id: u.id,
      email: u.email,
      phone: u.user_metadata?.phone || '',
      fullName: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
    };
  } catch {
    return null;
  }
}

/**
 * Fetch all active and rented spaces from Supabase
 */
export async function getCloudSpaces(): Promise<SpaceListing[] | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error, fallback to local:', error.message);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      category: row.listing_category || (
        (row.type?.toLowerCase().includes('seeking') || row.type?.toLowerCase().includes('looking for') || row.type?.toLowerCase().includes('seeker'))
          ? 'seeker'
          : (row.type?.toLowerCase().includes('replacement') || row.occupancy?.toLowerCase().includes('needed') || row.type?.toLowerCase().includes('shared'))
          ? 'replacement'
          : 'fresh'
      ),
      type: row.type,
      rent: row.rent,
      rawRent: Number(row.raw_rent || (row.rent ? String(row.rent).replace(/\D/g, '') : 0)),
      location: row.location,
      furnishing: row.furnishing,
      occupancy: row.occupancy,
      image: row.image || '',
      hostName: row.host_name,
      hostPhone: row.host_phone,
      status: row.status || 'active',
      description: row.description,
      amenities: row.amenities || [],
    }));
  } catch (err) {
    console.error('Failed to get cloud spaces:', err);
    return null;
  }
}

/**
 * Insert a new space into Supabase
 */
export async function insertCloudSpace(space: SpaceListing): Promise<boolean> {
  if (!supabase) return false;

  try {
    // Attempt insert with complete schema fields
    const payload: any = {
      id: space.id,
      type: space.type,
      rent: space.rent,
      raw_rent: space.rawRent,
      location: space.location,
      furnishing: space.furnishing,
      occupancy: space.occupancy,
      image: space.image,
      host_name: space.hostName,
      host_phone: space.hostPhone,
      status: space.status || 'active',
    };

    const isUuid = (val?: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val || '');

    if (isUuid(space.userId)) payload.user_id = space.userId;
    if (space.category) payload.listing_category = space.category;
    if (space.description) payload.description = space.description;
    if (space.amenities) payload.amenities = space.amenities;

    const { error } = await supabase.from('spaces').insert([payload]);

    if (error) {
      // Graceful fallback if custom columns or foreign keys/UUID mismatch
      console.warn('Primary insert failed, attempting clean fallback:', error.message);
      const { error: fallbackErr } = await supabase.from('spaces').insert([{
        id: space.id,
        type: space.type,
        rent: space.rent,
        raw_rent: space.rawRent,
        location: space.location,
        furnishing: space.furnishing,
        occupancy: space.occupancy,
        image: space.image,
        host_name: space.hostName,
        host_phone: space.hostPhone,
        status: space.status || 'active',
      }]);
      return !fallbackErr;
    }
    return true;
  } catch (err) {
    console.error('Failed to insert cloud space:', err);
    return false;
  }
}

/**
 * Update space status (active / rented)
 */
export async function updateCloudSpaceStatus(
  spaceId: string,
  status: 'active' | 'rented'
): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('spaces')
      .update({ status })
      .eq('id', spaceId);

    if (error) {
      console.error('Supabase space status update error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to update cloud space status:', err);
    return false;
  }
}

/**
 * Fetch all inquiries
 */
export async function getCloudInquiries(): Promise<Inquiry[] | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch inquiries error:', error.message);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      spaceId: row.space_id,
      hostId: row.host_id,
      seekerId: row.seeker_id,
      spaceTitle: row.space_title,
      hostName: row.host_name,
      hostPhone: row.host_phone,
      seekerName: row.seeker_name,
      seekerPhone: row.seeker_phone,
      moveInDate: row.move_in_date,
      note: row.note,
      timestamp: row.timestamp || 'Just now',
      status: row.status || 'new',
    }));
  } catch (err) {
    console.error('Failed to fetch cloud inquiries:', err);
    return null;
  }
}

/**
 * Insert inquiry
 */
export async function insertCloudInquiry(inquiry: Inquiry): Promise<boolean> {
  if (!supabase) return false;

  try {
    const payload: any = {
      id: inquiry.id,
      space_id: inquiry.spaceId,
      space_title: inquiry.spaceTitle,
      host_name: inquiry.hostName,
      host_phone: inquiry.hostPhone,
      seeker_name: inquiry.seekerName,
      seeker_phone: inquiry.seekerPhone,
      move_in_date: inquiry.moveInDate,
      note: inquiry.note,
      timestamp: inquiry.timestamp,
      status: inquiry.status,
    };

    const isUuid = (val?: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val || '');

    if (isUuid(inquiry.hostId)) payload.host_id = inquiry.hostId;
    if (isUuid(inquiry.seekerId)) payload.seeker_id = inquiry.seekerId;

    const { error } = await supabase.from('inquiries').insert([payload]);

    if (error) {
      console.warn('Primary inquiry insert failed, attempting fallback:', error.message);
      const { error: fallbackErr } = await supabase.from('inquiries').insert([{
        id: inquiry.id,
        space_id: inquiry.spaceId,
        space_title: inquiry.spaceTitle,
        host_name: inquiry.hostName,
        host_phone: inquiry.hostPhone,
        seeker_name: inquiry.seekerName,
        seeker_phone: inquiry.seekerPhone,
        move_in_date: inquiry.moveInDate,
        note: inquiry.note,
        timestamp: inquiry.timestamp,
        status: inquiry.status,
      }]);
      return !fallbackErr;
    }
    return true;
  } catch (err) {
    console.error('Failed to insert cloud inquiry:', err);
    return false;
  }
}

/**
 * Update inquiry status (contacted, closed, new)
 */
export async function updateCloudInquiryStatus(
  inquiryId: string,
  status: 'new' | 'contacted' | 'closed'
): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', inquiryId);

    if (error) {
      console.error('Supabase update inquiry status error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to update cloud inquiry status:', err);
    return false;
  }
}
