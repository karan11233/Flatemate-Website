-- ============================================================================
-- Flatemate Production Database Schema — Migration 00003: Storage Setup
-- ============================================================================
-- Supabase Storage bucket and access policies for property listing photos.
-- Enforces:
-- 1. Dual authorization: Authenticated user AND Space Ownership
-- 2. Strict file size limits (5 MB) and MIME type whitelist
-- 3. Protection against cross-listing photo tampering
-- 4. Path structure validation (<space_id>/<filename>.<ext>)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Create / Update Storage Bucket
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  true, -- Public read for CDN delivery
  5242880, -- 5 MB max per image
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- ----------------------------------------------------------------------------
-- 2. Storage RLS Policies
-- Storage Path Structure: listing-photos/<space_id>/<filename>.<ext>
-- ----------------------------------------------------------------------------

-- Public can view any listing image from the CDN
drop policy if exists "Public can view listing photos" on storage.objects;
create policy "Public can view listing photos"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

-- Dual authorization for Upload:
-- 1. Caller must be authenticated
-- 2. Caller must own the space referenced by the path: (storage.foldername(name))[1]
-- 3. Path must be strictly <space_id_uuid>/<clean_filename>.<ext> (no subfolders, no traversal)
drop policy if exists "Listing owners can upload photos" on storage.objects;
create policy "Listing owners can upload photos"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
    and array_length(storage.foldername(name), 1) = 1
    and name not like '%..%'
    and name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[a-zA-Z0-9_\-][a-zA-Z0-9_\-\. ]*\.(jpe?g|png|webp)$'
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
    and exists (
      select 1 from public.spaces s
      where s.id::text = (storage.foldername(name))[1]
      and s.user_id = auth.uid()
    )
  );

-- Dual authorization for Update:
-- Listing owner can replace existing photo for their space
drop policy if exists "Listing owners can update photos" on storage.objects;
create policy "Listing owners can update photos"
  on storage.objects for update
  using (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
    and array_length(storage.foldername(name), 1) = 1
    and name not like '%..%'
    and name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[a-zA-Z0-9_\-][a-zA-Z0-9_\-\. ]*\.(jpe?g|png|webp)$'
    and exists (
      select 1 from public.spaces s
      where s.id::text = (storage.foldername(name))[1]
      and s.user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
    and array_length(storage.foldername(name), 1) = 1
    and name not like '%..%'
    and name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[a-zA-Z0-9_\-][a-zA-Z0-9_\-\. ]*\.(jpe?g|png|webp)$'
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
    and exists (
      select 1 from public.spaces s
      where s.id::text = (storage.foldername(name))[1]
      and s.user_id = auth.uid()
    )
  );

-- Dual authorization for Delete:
-- Only the owner of the referenced space can delete photos
drop policy if exists "Listing owners can delete photos" on storage.objects;
create policy "Listing owners can delete photos"
  on storage.objects for delete
  using (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
    and array_length(storage.foldername(name), 1) = 1
    and name not like '%..%'
    and exists (
      select 1 from public.spaces s
      where s.id::text = (storage.foldername(name))[1]
      and s.user_id = auth.uid()
    )
  );
