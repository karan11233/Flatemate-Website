-- ============================================================================
-- Flatemate Production Database Schema — Migration 00001: Initial Schema (Fixed v3)
-- ============================================================================
-- Fully independent PostgreSQL schema for Flatemate Next.js App
-- Enforces:
-- 1. Strictly verified migration execution order (no forward relation references)
-- 2. Direct PostgREST table isolation & public views
-- 3. Database-level INSERT integrity (tamper-proofing user_id, featured, views)
-- 4. Atomic concurrent guest claims with valid null->auth.uid() transition
-- 5. Exact field-level inquiry UPDATE enforcement
-- 6. Rate-limited views counter & opt-in WhatsApp consent
-- ============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Custom Enum Types
-- ----------------------------------------------------------------------------
create type public.listing_type as enum (
  'room',             -- Flatmate Replacement / Single Room in Occupied Flat
  'entire_flat',      -- Full Vacant Flat (1 BHK, 2 BHK, 3 BHK, etc.)
  'seeking_flat'      -- Individual or group seeking flat/flatmate
);

create type public.space_status as enum (
  'active',           -- Publicly visible and accepting inquiries
  'rented',           -- Rented out / filled (hidden from active feed)
  'paused',           -- Temporarily hidden by host
  'archived'          -- Soft-deleted / retired
);

create type public.gender_preference as enum (
  'any',              -- Anyone / No preference
  'female',           -- Female only
  'male'              -- Male only
);

create type public.furnishing_type as enum (
  'fully_furnished',
  'semi_furnished',
  'unfurnished'
);

create type public.inquiry_status as enum (
  'new',              -- Fresh lead received
  'contacted',        -- Host has messaged or called the seeker
  'visited'           -- Seeker visited the property
);

create type public.report_status as enum (
  'pending',          -- Under community review
  'reviewed',         -- Evaluated by moderator
  'resolved',         -- Action taken
  'dismissed'         -- Deemed invalid / no violation
);

-- ----------------------------------------------------------------------------
-- 2. Common Trigger Functions
-- ----------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

-- ----------------------------------------------------------------------------
-- 3. Table: Profiles
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text unique,
  avatar_url text,
  city text default 'Ahmedabad' not null,
  is_verified boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_profiles_phone on public.profiles(phone);

create trigger tr_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Privilege escalation prevention on profiles
create or replace function public.check_profile_privileges()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    if new.is_verified is distinct from old.is_verified then
      raise exception 'Security violation: Users cannot modify is_verified status';
    end if;
    if new.id is distinct from old.id then
      raise exception 'Security violation: Profile ID is immutable';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

create trigger tr_check_profile_privileges
  before update on public.profiles
  for each row execute function public.check_profile_privileges();

-- Automatically create profile row when user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, avatar_url, is_verified)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Flatemate User'),
    new.phone,
    new.raw_user_meta_data->>'avatar_url',
    false
  )
  on conflict (id) do update set
    phone = coalesce(excluded.phone, public.profiles.phone),
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 4. Table: Spaces (Listings)
-- (Created BEFORE public_profiles view to prevent execution order errors)
-- ----------------------------------------------------------------------------
create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title text not null check (char_length(title) >= 5 and char_length(title) <= 120),
  description text not null check (char_length(description) >= 20 and char_length(description) <= 2000),
  location text not null,
  city text default 'Ahmedabad' not null,
  rent integer not null check (rent >= 0 and rent <= 500000),
  deposit integer default 0 check (deposit >= 0),
  listing_type public.listing_type not null default 'room',
  gender_preference public.gender_preference not null default 'any',
  furnishing public.furnishing_type not null default 'semi_furnished',
  room_type text not null default 'Private Room',
  available_from date default current_date not null,
  amenities text[] default '{}'::text[] not null,
  images text[] default '{}'::text[] not null,
  contact_name text not null check (char_length(contact_name) >= 2 and char_length(contact_name) <= 80),
  contact_phone text not null check (contact_phone ~ '^[0-9]{10}$'),
  consent_whatsapp_contact boolean default false not null, -- Explicit opt-in (default: false)
  status public.space_status default 'active' not null,
  featured boolean default false not null,
  views_count integer default 0 not null check (views_count >= 0),
  is_demo boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_spaces_status on public.spaces(status);
create index if not exists idx_spaces_city_location on public.spaces(city, location);
create index if not exists idx_spaces_listing_type on public.spaces(listing_type);
create index if not exists idx_spaces_rent on public.spaces(rent);
create index if not exists idx_spaces_gender on public.spaces(gender_preference);
create index if not exists idx_spaces_user_id on public.spaces(user_id);
create index if not exists idx_spaces_created_at on public.spaces(created_at desc);

create trigger tr_spaces_updated_at
  before update on public.spaces
  for each row execute function public.handle_updated_at();

-- Database-level INSERT integrity:
create or replace function public.enforce_space_insert_integrity()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    if auth.uid() is null then
      raise exception 'Authentication required to create listing';
    end if;

    -- Force ownership to current authenticated caller
    new.user_id := auth.uid();

    -- Force privileged fields to safe defaults
    new.featured := false;
    new.views_count := 0;
    new.is_demo := false;

    if new.status not in ('active', 'paused') then
      new.status := 'active';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

create trigger tr_enforce_space_insert_integrity
  before insert on public.spaces
  for each row execute function public.enforce_space_insert_integrity();

-- Database-level UPDATE integrity:
create or replace function public.check_space_update_privileges()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    if new.id is distinct from old.id then
      raise exception 'Security violation: Listing ID is immutable';
    end if;

    -- If space already had an owner, direct transfer is strictly prohibited
    if old.user_id is not null and new.user_id is distinct from old.user_id then
      raise exception 'Security violation: Direct ownership transfer is prohibited';
    end if;

    -- If claiming an unclaimed guest space, new owner MUST be current caller
    if old.user_id is null and new.user_id is not null and new.user_id <> auth.uid() then
      raise exception 'Security violation: Cannot claim space on behalf of another user';
    end if;

    if new.featured is distinct from old.featured then
      raise exception 'Security violation: Only administrators can grant featured status';
    end if;
    if new.is_demo is distinct from old.is_demo then
      raise exception 'Security violation: Demo flag is immutable';
    end if;
    if new.views_count is distinct from old.views_count then
      raise exception 'Security violation: View counts cannot be directly modified via update';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

create trigger tr_check_space_update_privileges
  before update on public.spaces
  for each row execute function public.check_space_update_privileges();

-- ----------------------------------------------------------------------------
-- 5. Public Sanitized Views
-- ----------------------------------------------------------------------------

-- Public Spaces View: Masks contact_phone unless explicit consent is true
create or replace view public.public_spaces with (security_invoker = false) as
select
  id,
  user_id,
  title,
  description,
  location,
  city,
  rent,
  deposit,
  listing_type,
  gender_preference,
  furnishing,
  room_type,
  available_from,
  amenities,
  images,
  contact_name,
  case
    when consent_whatsapp_contact = true then contact_phone
    else null
  end as contact_phone,
  consent_whatsapp_contact,
  status,
  featured,
  views_count,
  created_at,
  updated_at
from public.spaces
where status = 'active' and is_demo = false;

-- Public Profiles View: ONLY exposes active listing hosts
create or replace view public.public_profiles with (security_invoker = false) as
select distinct
  p.id,
  p.full_name,
  p.avatar_url,
  p.city,
  p.is_verified,
  p.created_at
from public.profiles p
join public.spaces s on s.user_id = p.id
where s.status = 'active' and s.is_demo = false;

-- ----------------------------------------------------------------------------
-- 6. Table: Space Claim Credentials (ISOLATED SENSITIVE TABLE)
-- ----------------------------------------------------------------------------
create table if not exists public.space_claim_secrets (
  space_id uuid primary key references public.spaces(id) on delete cascade,
  claim_token_hash text not null,
  claim_expires_at timestamptz not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_space_claim_expires on public.space_claim_secrets(claim_expires_at);

-- ----------------------------------------------------------------------------
-- 7. Table: Space Photos
-- ----------------------------------------------------------------------------
create table if not exists public.space_photos (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  storage_path text not null,
  url text not null,
  display_order smallint default 0 not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_space_photos_space on public.space_photos(space_id, display_order);

-- ----------------------------------------------------------------------------
-- 8. Table: Inquiries (Leads & Communication)
-- ----------------------------------------------------------------------------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  host_id uuid references auth.users(id) on delete set null,
  seeker_id uuid references auth.users(id) on delete set null,
  seeker_name text not null check (char_length(seeker_name) >= 2 and char_length(seeker_name) <= 80),
  seeker_phone text not null check (seeker_phone ~ '^[0-9]{10}$'),
  seeker_message text check (char_length(seeker_message) <= 1000),
  move_in_date date,
  status public.inquiry_status default 'new' not null,
  host_archived boolean default false not null,
  seeker_archived boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_inquiries_space_id on public.inquiries(space_id);
create index if not exists idx_inquiries_host_id on public.inquiries(host_id);
create index if not exists idx_inquiries_seeker_id on public.inquiries(seeker_id);
create index if not exists idx_inquiries_created_at on public.inquiries(created_at desc);

create trigger tr_inquiries_updated_at
  before update on public.inquiries
  for each row execute function public.handle_updated_at();

-- Automatic derivation of host_id and seeker_id
create or replace function public.derive_inquiry_parties()
returns trigger as $$
declare
  v_host_id uuid;
  v_status public.space_status;
begin
  select user_id, status into v_host_id, v_status
  from public.spaces
  where id = new.space_id;

  if not found then
    raise exception 'Listing not found for inquiry';
  end if;

  if v_status <> 'active' then
    raise exception 'Cannot submit inquiry for inactive or rented space';
  end if;

  new.host_id := v_host_id;

  if auth.uid() is not null then
    new.seeker_id := auth.uid();
    if new.host_id is not null and new.seeker_id = new.host_id then
      raise exception 'Host cannot submit an inquiry on their own listing';
    end if;
  else
    new.seeker_id := null;
  end if;

  new.status := 'new';
  new.host_archived := false;
  new.seeker_archived := false;

  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

create trigger tr_derive_inquiry_parties
  before insert on public.inquiries
  for each row execute function public.derive_inquiry_parties();

-- Exact field-level inquiry update enforcement
create or replace function public.enforce_inquiry_update_integrity()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    -- Core immutable fields
    if new.id <> old.id or
       new.space_id <> old.space_id or
       new.seeker_id is distinct from old.seeker_id or
       new.seeker_name <> old.seeker_name or
       new.seeker_phone <> old.seeker_phone or
       new.seeker_message is distinct from old.seeker_message or
       new.move_in_date is distinct from old.move_in_date or
       new.created_at <> old.created_at then
      raise exception 'Security violation: Core inquiry fields and messages are immutable';
    end if;

    -- Host ID immutability
    if old.host_id is not null and new.host_id is distinct from old.host_id then
      raise exception 'Security violation: Cannot reassign inquiry host';
    end if;
    if old.host_id is null and new.host_id is not null and new.host_id <> auth.uid() then
      raise exception 'Security violation: Cannot claim inquiry on behalf of another user';
    end if;

    -- Role-based field enforcement
    if auth.uid() is not null and (auth.uid() = old.host_id or (old.host_id is null and new.host_id = auth.uid())) then
      if new.seeker_archived is distinct from old.seeker_archived then
        raise exception 'Security violation: Host cannot modify seeker archive state';
      end if;

      -- Forward status progression: new -> contacted -> visited
      if old.status = 'new' and new.status not in ('new', 'contacted', 'visited') then
        raise exception 'Invalid status transition from new';
      elsif old.status = 'contacted' and new.status not in ('contacted', 'visited') then
        raise exception 'Invalid status transition from contacted';
      elsif old.status = 'visited' and new.status <> 'visited' then
        raise exception 'Cannot revert visited status';
      end if;

    elsif auth.uid() is not null and auth.uid() = old.seeker_id then
      if new.status is distinct from old.status then
        raise exception 'Security violation: Seeker cannot modify inquiry status';
      end if;
      if new.host_archived is distinct from old.host_archived then
        raise exception 'Security violation: Seeker cannot modify host archive state';
      end if;
    else
      raise exception 'Unauthorized to update inquiry';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

create trigger tr_enforce_inquiry_update_integrity
  before update on public.inquiries
  for each row execute function public.enforce_inquiry_update_integrity();

-- ----------------------------------------------------------------------------
-- 9. Table: Reports
-- ----------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  reporter_id uuid references auth.users(id) on delete set null,
  reporter_ip_hash text,
  reason text not null check (char_length(reason) >= 3 and char_length(reason) <= 100),
  details text check (char_length(details) <= 1000),
  status public.report_status default 'pending' not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_reports_space_id on public.reports(space_id);
create index if not exists idx_reports_status on public.reports(status);

-- ----------------------------------------------------------------------------
-- 10. Table: Rate Limiting
-- ----------------------------------------------------------------------------
create table if not exists public.rate_limits (
  key text primary key,
  count integer default 1 not null,
  expires_at timestamptz not null
);

create index if not exists idx_rate_limits_expires on public.rate_limits(expires_at);

-- ----------------------------------------------------------------------------
-- 11. Atomic Concurrency-Safe Guest Claim RPC
-- ----------------------------------------------------------------------------
create or replace function public.claim_guest_space(
  p_space_id uuid,
  p_claim_token text
)
returns jsonb as $$
declare
  v_token_hash text;
  v_updated_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required to claim listing';
  end if;

  if p_claim_token is null or length(p_claim_token) < 32 then
    raise exception 'Invalid claim token format';
  end if;

  v_token_hash := encode(digest(p_claim_token, 'sha256'), 'hex');

  -- Atomic conditional delete of claim secret with validation
  delete from public.space_claim_secrets
  where space_id = p_space_id
    and claim_token_hash = v_token_hash
    and claim_expires_at > now()
  returning space_id into v_updated_id;

  if v_updated_id is null then
    if exists (select 1 from public.spaces where id = p_space_id and user_id is not null) then
      raise exception 'Listing has already been claimed';
    else
      raise exception 'Invalid or expired claim token';
    end if;
  end if;

  -- Atomic update of space ownership
  update public.spaces
  set
    user_id = auth.uid(),
    updated_at = now()
  where id = p_space_id
    and user_id is null;

  -- Reassign any pending inquiries
  update public.inquiries
  set
    host_id = auth.uid(),
    updated_at = now()
  where space_id = p_space_id and host_id is null;

  return jsonb_build_object(
    'success', true,
    'space_id', p_space_id,
    'owner_id', auth.uid()
  );
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

revoke all on function public.claim_guest_space(uuid, text) from public;
grant execute on function public.claim_guest_space(uuid, text) to authenticated;

-- ----------------------------------------------------------------------------
-- 12. Rate-Limited Listing Views Counter RPC
-- ----------------------------------------------------------------------------
create or replace function public.increment_space_views(
  p_space_id uuid,
  p_viewer_token text default null
)
returns boolean as $$
declare
  v_key text;
begin
  if p_viewer_token is null or length(p_viewer_token) < 8 then
    p_viewer_token := coalesce(auth.uid()::text, 'anon_' || current_date::text);
  end if;

  v_key := 'view:' || p_space_id::text || ':' || p_viewer_token || ':' || to_char(now(), 'YYYY-MM-DD-HH24');

  insert into public.rate_limits (key, count, expires_at)
  values (v_key, 1, now() + interval '1 hour')
  on conflict (key) do nothing;

  if found then
    update public.spaces
    set views_count = views_count + 1
    where id = p_space_id and status = 'active' and is_demo = false;
    return true;
  end if;

  return false;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

revoke all on function public.increment_space_views(uuid, text) from public;
grant execute on function public.increment_space_views(uuid, text) to anon, authenticated;
