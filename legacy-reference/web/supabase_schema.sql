-- ==============================================================================
-- FLATEMATE SUPABASE DATABASE SCHEMA & MIGRATION
-- Run this script in your Supabase Project's "SQL Editor" -> Click "Run"
-- ==============================================================================

-- 1. Create 'spaces' table (Properties, Rooms, Replacements)
create table if not exists public.spaces (
  id text primary key,
  user_id text, -- Supabase Auth User ID
  listing_category text default 'fresh', -- 'fresh' or 'replacement'
  type text not null,
  rent text not null,
  raw_rent numeric not null default 0,
  location text not null,
  furnishing text default 'Fully Furnished',
  occupancy text default '1 spot available',
  image text,
  host_name text not null,
  host_phone text not null,
  description text,
  amenities text[],
  status text not null default 'active', -- 'active' or 'rented'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- In case 'spaces' table already existed, add new columns:
alter table public.spaces add column if not exists user_id text;
alter table public.spaces add column if not exists listing_category text default 'fresh';
alter table public.spaces add column if not exists description text;
alter table public.spaces add column if not exists amenities text[];

-- 2. Create 'inquiries' table (Seeker leads & WhatsApp requests)
create table if not exists public.inquiries (
  id text primary key,
  space_id text references public.spaces(id) on delete cascade,
  host_id text, -- Supabase Auth User ID of property host
  seeker_id text, -- Supabase Auth User ID of inquiring seeker
  space_title text,
  host_name text,
  host_phone text not null,
  seeker_name text not null,
  seeker_phone text not null,
  move_in_date text,
  note text,
  timestamp text default 'Just now',
  status text not null default 'new', -- 'new', 'contacted', 'closed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- In case 'inquiries' table already existed, add new columns:
alter table public.inquiries add column if not exists host_id text;
alter table public.inquiries add column if not exists seeker_id text;

-- 3. Enable Row Level Security (RLS)
alter table public.spaces enable row level security;
alter table public.inquiries enable row level security;

-- 4. Create Policies (Allow public browsing and posting for MVP)
create policy "Public can view all spaces" 
  on public.spaces for select 
  using (true);

create policy "Public can insert new spaces" 
  on public.spaces for insert 
  with check (true);

create policy "Public can update space status" 
  on public.spaces for update 
  using (true);

create policy "Public can view inquiries" 
  on public.inquiries for select 
  using (true);

create policy "Public can insert new inquiries" 
  on public.inquiries for insert 
  with check (true);

create policy "Public can update inquiry status" 
  on public.inquiries for update 
  using (true);
