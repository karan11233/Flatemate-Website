'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { validateSpaceInput } from '@/lib/validations';
import { INITIAL_MOCK_SPACES } from '@/data/mockData';
import { SpaceListing } from '@/types';

/**
 * Fetch public listings from the sanitized public_spaces view
 */
export async function getPublicSpacesAction(): Promise<{ data: SpaceListing[]; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      // Local development fallback
      return { data: INITIAL_MOCK_SPACES };
    }

    const { data, error } = await supabase
      .from('public_spaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch failed, using fallback:', error.message);
      return { data: INITIAL_MOCK_SPACES };
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

    return { data: mapped.length > 0 ? mapped : INITIAL_MOCK_SPACES };
  } catch (err: any) {
    return { data: INITIAL_MOCK_SPACES, error: err.message };
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

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: true, id: `mock-${Date.now()}` };
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

  return { success: true, id: inserted?.id };
}

/**
 * Update space status (Host only)
 */
export async function updateSpaceStatusAction(
  spaceId: string,
  newStatus: 'active' | 'rented' | 'paused'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: true };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('spaces')
    .update({ status: newStatus })
    .eq('id', spaceId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Increment listing views counter safely via rate-limited RPC
 */
export async function incrementSpaceViewsAction(
  spaceId: string,
  viewerToken?: string
): Promise<{ success: boolean }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: true };
  }

  await supabase.rpc('increment_space_views', {
    p_space_id: spaceId,
    p_viewer_token: viewerToken || null,
  });

  return { success: true };
}
