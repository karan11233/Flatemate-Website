-- ============================================================================
-- Flatemate Production Database Schema — Migration 00003: Storage Setup
-- ============================================================================
-- Supabase Storage bucket and access policies for property listing photos.
-- Enforces:
-- 1. Dual verification: Authenticated user AND Verified Space Ownership
-- 2. Strict file size limits (5 MB) and MIME type whitelist
-- 3. Protection against cross-listing photo tampering
-- ============================================================================

-- Ensure storage schema and tables exist (handles both Supabase CLI and local setups)
create schema if not exists storage;

create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  owner uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  public boolean default false,
  avif_autodetection boolean default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text not null,
  owner uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_accessed_at timestamptz default now(),
  metadata jsonb,
  path_tokens text[] generated always as (string_to_array(name, '/')) stored
);

-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

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

-- Dual verification for Upload:
-- 1. Caller must be authenticated
-- 2. Caller must own the space referenced by the path: (storage.foldername(name))[1]
drop policy if exists "Listing owners can upload photos" on storage.objects;
create policy "Listing owners can upload photos"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.spaces s
      where s.id::text = (storage.foldername(name))[1]
      and s.user_id = auth.uid()
    )
  );

-- Dual verification for Update:
-- Listing owner can replace existing photo for their space
drop policy if exists "Listing owners can update photos" on storage.objects;
create policy "Listing owners can update photos"
  on storage.objects for update
  using (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.spaces s
      where s.id::text = (storage.foldername(name))[1]
      and s.user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.spaces s
      where s.id::text = (storage.foldername(name))[1]
      and s.user_id = auth.uid()
    )
  );

-- Dual verification for Delete:
-- Only the owner of the referenced space can delete photos
drop policy if exists "Listing owners can delete photos" on storage.objects;
create policy "Listing owners can delete photos"
  on storage.objects for delete
  using (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.spaces s
      where s.id::text = (storage.foldername(name))[1]
      and s.user_id = auth.uid()
    )
  );
