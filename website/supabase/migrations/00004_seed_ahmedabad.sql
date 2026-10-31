-- ============================================================================
-- Flatemate Database — Migration 00004: Development-Only Seed Data (Fail-Closed)
-- ============================================================================
-- CAUTION: FOR LOCAL AND STAGING DEVELOPMENT ONLY!
-- Strictly guarded: FAILS CLOSED unless app.environment is explicitly set to
-- 'development', 'local_test', or 'staging'.
-- ============================================================================

-- Strict fail-closed environment guard
do $$
begin
  if coalesce(current_setting('app.environment', true), '') not in ('development', 'local_test', 'staging') then
    raise exception 'FATAL: Seed migration rejected. Environment setting "app.environment" must be explicitly set to development, local_test, or staging (current value: "%")', coalesce(current_setting('app.environment', true), 'UNSET');
  end if;
end $$;

insert into public.spaces (
  id,
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
  contact_phone,
  consent_whatsapp_contact,
  status,
  featured,
  views_count,
  is_demo
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    '[DEMO] 2BHK Shared Apartment in Satellite',
    '[LOCAL DEVELOPMENT SEED] Looking for a chill bachelor to take up a private room with attached bath in our 2BHK near Jodhpur Cross Road. High-speed WiFi, AC, maid and cook setup ready and shared equally.',
    'Satellite',
    'Ahmedabad',
    8500,
    17000,
    'room',
    'male',
    'fully_furnished',
    'Private Room',
    current_date,
    array['WiFi', 'Air Conditioner', 'Attached Bath', 'Balcony', 'RO Water', 'Covered Parking'],
    array['/assets/flat1.png'],
    'Demo Host Meet',
    '0000000001',
    false, -- Explicit opt-in default: false
    'active',
    true,
    142,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '[DEMO] Private Room in 3BHK Gated Society',
    '[LOCAL DEVELOPMENT SEED] One master bedroom available for working professional girl in a quiet family-friendly high-rise near Vastrapur Lake. Fully functional kitchen, washing machine, and 24/7 security.',
    'Vastrapur',
    'Ahmedabad',
    7000,
    14000,
    'room',
    'female',
    'semi_furnished',
    'Private Room',
    current_date,
    array['Gated Society', 'Washing Machine', 'Fridge', 'Lift', 'Security Guard', 'Geyser'],
    array['/assets/flat2.png'],
    'Demo Host Hardik',
    '0000000002',
    false,
    'active',
    true,
    98,
    true
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '[DEMO] Spacious 3BHK Available for Group / Family',
    '[LOCAL DEVELOPMENT SEED] Full independent 3BHK flat available for rent on main corporate road. Huge hall, modular kitchen, 3 balconies, 2 covered car parkings. No brokerage, direct deal with owner.',
    'Prahlad Nagar',
    'Ahmedabad',
    28000,
    56000,
    'entire_flat',
    'any',
    'fully_furnished',
    'Entire Flat',
    current_date,
    array['Full Flat', 'Modular Kitchen', '3 Balconies', 'Covered Car Parking', 'Power Backup', 'Gym'],
    array['/assets/flat3.png'],
    'Demo Host Anjali',
    '0000000003',
    false,
    'active',
    false,
    215,
    true
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '[DEMO] Twin Sharing Bed in Pre-Occupied Flat',
    '[LOCAL DEVELOPMENT SEED] Looking for 1 vegetarian boy to share a large room in 2BHK flat near commerce six roads. Extremely close to HL College, Navrangpura bus stand, and metro station.',
    'Navrangpura',
    'Ahmedabad',
    4500,
    9000,
    'room',
    'male',
    'semi_furnished',
    'Shared Room',
    current_date,
    array['Twin Sharing', 'Pure Veg', 'Near Metro', 'Wardrobe', 'Study Table', 'High Speed WiFi'],
    array['/assets/flat4.png'],
    'Demo Host Parth',
    '0000000004',
    false,
    'active',
    false,
    84,
    true
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    '[DEMO] Software Engineer Seeking Room / Flatmate',
    '[LOCAL DEVELOPMENT SEED] Relocating to Ahmedabad next week for an IT job at SG Highway. Looking for an occupied flat or compatible flatmates willing to rent a 2BHK together in Bodakdev or Thaltej.',
    'Bodakdev',
    'Ahmedabad',
    10000,
    0,
    'seeking_flat',
    'any',
    'fully_furnished',
    'Seeking Flatmate',
    current_date,
    array['Vegetarian Preferred', 'Non Smoker', 'Quiet & Clean', 'Working Professional'],
    array['/assets/flat5.png'],
    'Demo Seeker Pooja',
    '0000000005',
    false,
    'active',
    true,
    176,
    true
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    '[DEMO] Modern 1BHK / Studio for Solo Professional',
    '[LOCAL DEVELOPMENT SEED] Compact luxury studio setup with modular kitchen, sofa-cum-bed, workstation, and personal balcony overlooking SG Highway. Ideal for corporate executives.',
    'SG Highway',
    'Ahmedabad',
    14000,
    28000,
    'entire_flat',
    'any',
    'fully_furnished',
    'Entire Flat',
    current_date,
    array['Personal Balcony', 'Smart TV', 'Workstation', 'AC', 'Microwave', '24/7 Water'],
    array['/assets/flat6.png'],
    'Demo Host Rohan',
    '0000000006',
    false,
    'active',
    false,
    130,
    true
  )
on conflict (id) do nothing;
