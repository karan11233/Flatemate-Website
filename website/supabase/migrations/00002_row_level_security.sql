-- ============================================================================
-- Flatemate Production Database Schema — Migration 00002: Row Level Security (Hardened v2)
-- ============================================================================
-- Zero-trust RLS policies and PostgREST access controls.
-- Enforces:
-- 1. Direct PostgREST SELECT on raw public.spaces returns ONLY rows owned by caller.
--    Anonymous queries to raw spaces return 0 rows. Public browsing MUST query public_spaces.
-- 2. Sensitive claim tokens completely isolated in space_claim_secrets (zero public access).
-- 3. Strict field-level UPDATE boundaries on inquiries and spaces.
-- 4. Hard deletion denied on inquiries to preserve participant communication records.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Enable RLS on All Tables
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.space_claim_secrets enable row level security;
alter table public.space_photos enable row level security;
alter table public.inquiries enable row level security;
alter table public.reports enable row level security;
alter table public.rate_limits enable row level security;

-- ----------------------------------------------------------------------------
-- 2. Profiles Policies & Grants
-- ----------------------------------------------------------------------------
-- Direct table access only permits viewing own user profile
create policy "Users can only view own profile table"
  on public.profiles for select
  using (auth.uid() is not null and auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() is not null and auth.uid() = id)
  with check (auth.uid() is not null and auth.uid() = id);

-- Grant access to the filtered public_profiles view
revoke all on public.profiles from anon;
grant select on public.public_profiles to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. Spaces (Listings) Policies & Grants
-- ----------------------------------------------------------------------------
-- CRITICAL DEFENSE: Direct PostgREST queries to raw public.spaces return ONLY
-- the caller's own listings. Anonymous visitors get 0 rows.
-- Public browsing MUST query the sanitized public.public_spaces view.
create policy "Users can view own listings on raw table"
  on public.spaces for select
  using (auth.uid() is not null and auth.uid() = user_id);

-- Authenticated users can create listings
create policy "Authenticated users can create spaces"
  on public.spaces for insert
  with check (
    auth.uid() is not null
    and auth.uid() = user_id
  );

-- Only verified owners can update their listings (Triggers enforce business fields)
create policy "Owners can update own spaces"
  on public.spaces for update
  using (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

-- Only verified owners can delete their listings
create policy "Owners can delete own spaces"
  on public.spaces for delete
  using (auth.uid() is not null and auth.uid() = user_id);

-- Public browsing grant on sanitized view
grant select on public.public_spaces to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4. Space Claim Secrets Policies & Grants
-- ----------------------------------------------------------------------------
-- Zero public access. Managed entirely via service_role and claim_guest_space RPC
create policy "Service role only for claim secrets"
  on public.space_claim_secrets
  using (auth.role() = 'service_role');

revoke all on public.space_claim_secrets from anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5. Space Photos Policies
-- ----------------------------------------------------------------------------
create policy "Public can view space photos"
  on public.space_photos for select
  using (true);

create policy "Space owners can insert photos"
  on public.space_photos for insert
  with check (
    exists (
      select 1 from public.spaces s
      where s.id = space_photos.space_id
      and s.user_id = auth.uid()
    )
  );

create policy "Space owners can delete photos"
  on public.space_photos for delete
  using (
    exists (
      select 1 from public.spaces s
      where s.id = space_photos.space_id
      and s.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 6. Inquiries Policies
-- ----------------------------------------------------------------------------
-- Zero unauthenticated leaks: anonymous queries return 0 rows
create policy "Hosts and seekers can view own inquiries"
  on public.inquiries for select
  using (
    auth.uid() is not null
    and (
      (auth.uid() = host_id and host_archived = false)
      or (auth.uid() = seeker_id and seeker_archived = false)
    )
  );

create policy "Anyone can submit inquiry"
  on public.inquiries for insert
  with check (
    char_length(seeker_name) >= 2
    and seeker_phone ~ '^[0-9]{10}$'
  );

create policy "Participants can update inquiry"
  on public.inquiries for update
  using (
    auth.uid() is not null
    and (
      auth.uid() = host_id
      or auth.uid() = seeker_id
    )
  )
  with check (
    auth.uid() is not null
    and (
      auth.uid() = host_id
      or auth.uid() = seeker_id
    )
  );

-- Hard deletion strictly denied to protect records
create policy "Deny unilateral hard delete inquiries"
  on public.inquiries for delete
  using (false);

-- ----------------------------------------------------------------------------
-- 7. Reports & Rate Limits
-- ----------------------------------------------------------------------------
create policy "Anyone can submit listing report"
  on public.reports for insert
  with check (char_length(reason) >= 3);

create policy "Reporters can view own reports"
  on public.reports for select
  using (auth.uid() is not null and auth.uid() = reporter_id);

create policy "Service role manages rate limits"
  on public.rate_limits
  using (auth.role() = 'service_role');

revoke all on public.rate_limits from anon, authenticated;
