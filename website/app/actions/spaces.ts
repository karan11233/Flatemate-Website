'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { validateSpaceInput, isValidUUID } from '@/lib/validations';
import { INITIAL_MOCK_SPACES } from '@/data/mockData';
import { SpaceListing } from '@/types';

/**
 * Fetch public listings from the sanitized public_spaces view
 */
export async function getPublicSpacesAction(): Promise<{ data: SpaceListing[]; error?: string }> {
  const isDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true';

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      if (isDemoMode) {
        return { data: INITIAL_MOCK_SPACES };
      }
      return { data: [], error: 'Database service is not configured' };
    }

    const { data, error } = await supabase
      .from('public_spaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch failed:', error.message);
      if (isDemoMode) {
        return { data: INITIAL_MOCK_SPACES, error: error.message };
      }
      return { data: [], error: error.message };
    }

    // Map database rows to UI SpaceListing interface
    const mapped: SpaceListing[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      category: row.listing_type === 'seeking_flat' ? 'seeker' : row.listing_type === 'room' ? 'replacement' : 'fresh',
      type: row.title,
      rent: `₹${Number(row.rent).toLocaleString('en-IN')}`,
      rawRent: Number(row.rent),
      location: `${row.location}, ${row.city || 'Ahmedabad'}`,
      city: row.city || 'Ahmedabad',
      furnishing: row.furnishing === 'fully_furnished' ? 'Fully Furnished' : row.furnishing === 'semi_furnished' ? 'Semi-Furnished' : 'Unfurnished',
      occupancy: row.room_type || 'Available now',
      image: Array.isArray(row.images) && row.images.length > 0 ? row.images[0] : '/assets/flat1.png',
      hostName: row.contact_name,
      hostPhone: row.contact_phone || undefined, // Masked if consent was false
      status: row.status as 'active' | 'rented',
      verified: Boolean(row.featured),
      description: row.description,
      amenities: Array.isArray(row.amenities) ? row.amenities : [],
      createdAt: row.created_at,
    }));

    // Successful query returning zero spaces returns empty array
    return { data: mapped };
  } catch (err: any) {
    if (isDemoMode) {
      return { data: INITIAL_MOCK_SPACES, error: err.message };
    }
    return { data: [], error: err.message };
  }
}

/**
 * Create a new property listing
 * (Unverified guest claims and external uploads remain disabled until approved)
 */
export async function createSpaceAction(payload: any): Promise<{ success: boolean; id?: string; error?: string }> {
  const validation = validateSpaceInput(payload);
  if (validation.error || !validation.data) {
    return { success: false, error: validation.error };
  }

  const isDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true';
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    if (isDemoMode) {
      return { success: true, id: `mock-${Date.now()}` };
    }
    return { success: false, error: 'Database service is not configured' };
  }

  // Security Invariant: Require authenticated session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return {
      success: false,
      error: 'Authentication required. Please sign in to list your space.',
    };
  }

  const { data: inserted, error: insertError } = await supabase
    .from('spaces')
    .insert({
      user_id: user.id,
      title: validation.data.title,
      description: validation.data.description,
      location: validation.data.location,
      city: validation.data.city,
      rent: validation.data.rent,
      deposit: validation.data.deposit,
      listing_type: validation.data.listingType,
      gender_preference: validation.data.genderPreference,
      furnishing: validation.data.furnishing,
      room_type: validation.data.roomType,
      amenities: validation.data.amenities,
      images: validation.data.images.length > 0 ? validation.data.images : ['/assets/flat1.png'],
      contact_name: validation.data.contactName,
      contact_phone: validation.data.contactPhone,
      consent_whatsapp_contact: validation.data.consentWhatsappContact,
      status: 'active',
    })
    .select('id')
    .single();

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  if (!inserted?.id) {
    return { success: false, error: 'Database did not return created listing ID' };
  }

  return { success: true, id: inserted.id };
}

/**
 * Update space status (Host only)
 */
export async function updateSpaceStatusAction(
  spaceId: string,
  newStatus: 'active' | 'rented' | 'paused'
): Promise<{ success: boolean; error?: string }> {
  if (!isValidUUID(spaceId)) {
    return { success: false, error: 'Invalid space ID' };
  }

  const isDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true';
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    if (isDemoMode) return { success: true };
    return { success: false, error: 'Database service is not configured' };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Authentication required' };
  }

  const { data, error } = await supabase
    .from('spaces')
    .update({ status: newStatus })
    .eq('id', spaceId)
    .eq('user_id', user.id)
    .select('id');

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data || data.length === 0) {
    return { success: false, error: 'Space not found or unauthorized to update status' };
  }

  return { success: true };
}

/**
 * Increment listing views counter safely via rate-limited RPC
 */
export async function incrementSpaceViewsAction(
  spaceId: string,
  viewerToken?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isValidUUID(spaceId)) {
    return { success: false, error: 'Invalid space ID' };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Database service is not configured' };
  }

  try {
    const { error } = await supabase.rpc('increment_space_views', {
      p_space_id: spaceId,
      p_viewer_token: viewerToken || null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to increment view counter' };
  }
}
