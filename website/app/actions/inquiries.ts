'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { validateInquiryInput, isValidUUID } from '@/lib/validations';
import { INITIAL_MOCK_INQUIRIES } from '@/data/mockData';
import { Inquiry } from '@/types';

/**
 * Submit an inquiry for a space
 * Database trigger automatically derives real host_id and seeker_id
 */
export async function submitInquiryAction(payload: any): Promise<{ success: boolean; id?: string; error?: string }> {
  const validation = validateInquiryInput(payload);
  if (validation.error || !validation.data) {
    return { success: false, error: validation.error };
  }

  const isDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true';
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    if (isDemoMode) {
      return { success: true, id: `mock-inq-${Date.now()}` };
    }
    return { success: false, error: 'Database service is not configured' };
  }

  const { data: inserted, error } = await supabase
    .from('inquiries')
    .insert({
      space_id: validation.data.spaceId,
      seeker_name: validation.data.seekerName,
      seeker_phone: validation.data.seekerPhone,
      seeker_message: validation.data.seekerMessage || null,
      move_in_date: validation.data.moveInDate || null,
      status: 'new',
    })
    .select('id')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  if (!inserted?.id) {
    return { success: false, error: 'Database did not return created inquiry ID' };
  }

  return { success: true, id: inserted.id };
}

/**
 * Get inquiries received by the authenticated host
 * Strictly requires verified session. Zero unauthenticated phone-number lookup.
 */
export async function getHostInquiriesAction(): Promise<{ data: Inquiry[]; error?: string }> {
  const isDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true';
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    if (isDemoMode) {
      return { data: INITIAL_MOCK_INQUIRIES };
    }
    return { data: [], error: 'Database service is not configured' };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: [], error: 'Authentication required to view host leads' };
  }

  const { data, error } = await supabase
    .from('inquiries')
    .select(`
      *,
      spaces (
        title,
        contact_name,
        contact_phone
      )
    `)
    .eq('host_id', user.id)
    .eq('host_archived', false)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  const mapped: Inquiry[] = (data || []).map((row: any) => ({
    id: row.id,
    spaceId: row.space_id,
    hostId: row.host_id,
    seekerId: row.seeker_id,
    spaceTitle: row.spaces?.title || 'Shared Living Space',
    hostName: row.spaces?.contact_name || 'Host',
    hostPhone: row.spaces?.contact_phone || '',
    seekerName: row.seeker_name,
    seekerPhone: row.seeker_phone,
    moveInDate: row.move_in_date || 'Flexible',
    note: row.seeker_message || '',
    timestamp: new Date(row.created_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    status: row.status as 'new' | 'contacted' | 'visited',
    createdAt: row.created_at,
  }));

  return { data: mapped };
}

/**
 * Update inquiry status (Host only: new -> contacted -> visited)
 */
export async function updateInquiryStatusAction(
  inquiryId: string,
  newStatus: 'new' | 'contacted' | 'visited'
): Promise<{ success: boolean; error?: string }> {
  if (!isValidUUID(inquiryId)) {
    return { success: false, error: 'Invalid inquiry ID' };
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
    .from('inquiries')
    .update({ status: newStatus })
    .eq('id', inquiryId)
    .eq('host_id', user.id)
    .select('id');

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data || data.length === 0) {
    return { success: false, error: 'Inquiry not found or unauthorized to update' };
  }

  return { success: true };
}

/**
 * Archive an inquiry (Soft-delete for participant view)
 */
export async function archiveInquiryAction(
  inquiryId: string,
  role: 'host' | 'seeker'
): Promise<{ success: boolean; error?: string }> {
  if (!isValidUUID(inquiryId)) {
    return { success: false, error: 'Invalid inquiry ID' };
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

  const updatePayload = role === 'host' ? { host_archived: true } : { seeker_archived: true };
  const filterKey = role === 'host' ? 'host_id' : 'seeker_id';

  const { data, error } = await supabase
    .from('inquiries')
    .update(updatePayload)
    .eq('id', inquiryId)
    .eq(filterKey, user.id)
    .select('id');

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data || data.length === 0) {
    return { success: false, error: 'Inquiry not found or unauthorized to archive' };
  }

  return { success: true };
}
