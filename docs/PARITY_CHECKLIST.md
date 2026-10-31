# Flatemate Website — Parity Checklist & Migration Mapping

**Source of Truth:** `B:\Flatemate-Website\legacy-reference\web\` (specifically `src/App.tsx`, `src/components/*`, `src/lib/*`, `index.html`)  
**Target:** `B:\Flatemate-Website\website\` (Next.js App Router + TypeScript + Tailwind CSS)  
**Strategy:** 100% Visual and Behavioral Parity with Hardened Backend Security

---

## 1. Visual Design, Branding & Tokens Parity

| Token / Asset | Legacy Specification | Next.js Implementation | Parity Status |
|---|---|---|---|
| **Primary Color** | `#4F46E5` (Indigo 600) | Identical CSS variable `--primary: #4F46E5` | **EXACT MATCH** |
| **Secondary Background** | `#F8FAFC` (Slate 50) | Identical CSS variable `--secondary: #F8FAFC` | **EXACT MATCH** |
| **Tertiary / Success** | `#10B981` (Emerald 500) | Identical CSS variable `--tertiary: #10B981` | **EXACT MATCH** |
| **Accent / Pill Light** | `#EEF2FF` (Indigo 50) | Identical CSS variable `--accent: #EEF2FF` | **EXACT MATCH** |
| **Text Foreground** | `#111827` (Gray 900) | Identical CSS variable `--foreground: #111827` | **EXACT MATCH** |
| **Muted Text** | `#64748B` (Slate 500) | Identical CSS variable `--muted-foreground: #64748B` | **EXACT MATCH** |
| **Card / Border Radius** | `0.875rem` (14px rounded-xl) | `rounded-xl` / `rounded-2xl` matching current utility classes | **EXACT MATCH** |
| **Typography** | `Plus Jakarta Sans`, `Inter`, `JetBrains Mono` | Next.js `next/font/google` for `Plus Jakarta Sans` & `Inter` | **EXACT MATCH** (Faster load) |
| **Logo & Brand Assets** | `/assets/flatemate-logo-alt.jpg`, `logo.svg`, `hero.png` | Preserved in `website/public/assets/` exactly as in legacy | **EXACT MATCH** |

---

## 2. Page Sections & Component Inventory (Top-to-Bottom)

### 2.1. Header & Navigation Bar (`App.tsx:500-583`)
- [x] **Logo & Brand**: Flatemate icon + bold wordmark linking to `#home`.
- [x] **Desktop Nav Links**: `Home` (`#home`), `Explore Flats` (`#discover`), `Ahmedabad Feed` (`#spaces`), `How it Works` (`#how-it-works`), `List Space` (`#list-space`).
- [x] **My Listings Action Button**: Opens `MyListingsModal` with active listing/inquiry badge count.
- [x] **User Auth Action**: Displays logged-in user name / phone with sign-out dropdown, or "Sign In" button opening `AuthModal`.
- [x] **"List Space" CTA Button**: High-visibility pill button linking to `#list-space`.
- [x] **Mobile Sticky Bottom Nav (`App.tsx:2480-2510`)**: 5 bottom-tab items (Home, Feed, List Space, My Listings, Profile/Sign In) displayed on `<lg` screens.

### 2.2. Hero Section (`App.tsx:584-696`)
- [x] **Eyebrow Tag**: `"AHMEDABAD'S DIRECT FLAT & FLATMATES NETWORK"` in indigo badge.
- [x] **Hero Headline**: `"Find Flats & Flatmates in Ahmedabad with 0% Brokerage"`.
- [x] **Subheading Copy**: `"Browse verified vacant flats, room replacements, and roommate requirements in Ahmedabad. Connect directly on WhatsApp with zero brokerage."`
- [x] **Hero Action Buttons**:
  - Primary button: `"Browse Ahmedabad Flats"` (smooth scroll to `#spaces`).
  - Outline button: `"List Your Flat / Room"` (smooth scroll to `#list-space`).
- [x] **Trust Metric Callouts**:
  - `0% Brokerage` (Always free for seekers & listers).
  - `Direct Connect` (Direct WhatsApp / call with residents).
  - `Verified Listings` (Authentic flatmate postings).
- [x] **Hero Graphic**: Dual lifestyle apartment showcase image.

### 2.3. Discovery Category Cards (`App.tsx:697-802`)
- [x] **Section Title**: `"Browse by What You Need"`.
- [x] **Card 1: Vacant Flats & Rooms**:
  - Icon: Home / building.
  - Description: Full 1BHK, 2BHK, 3BHK flats and private rooms for rent.
  - Action: Sets category filter to `fresh` and scrolls to feed.
- [x] **Card 2: Flatmate Replacements**:
  - Icon: Users / people exchange.
  - Description: Single occupancy openings in already-occupied shared apartments.
  - Action: Sets category filter to `replacement` and scrolls to feed.
- [x] **Card 3: Roommate Seekers**:
  - Icon: Search / user beacon.
  - Description: Verified professionals & students looking for shared accommodation.
  - Action: Sets category filter to `seeker` and scrolls to feed.

### 2.4. Search & Filter Bar (`App.tsx:803-879`)
- [x] **Category Filter Tabs**: `All`, `Fresh Flats`, `Need Replacement`, `Looking for Flat`.
- [x] **Locality Dropdown**: All Ahmedabad Localities, Satellite, Vastrapur, Navrangpura, Prahlad Nagar, Bopal, Bodakdev, SG Highway, Thaltej, South Bopal, Paldi.
- [x] **Budget Dropdown**: Any Budget, Under ₹10,000, ₹10,000 - ₹20,000, ₹20,000 - ₹35,000, Above ₹35,000.
- [x] **Filter Reset Action**: Clear filters to default view.

### 2.5. Live Listing Feed (`App.tsx:880-1233`)
- [x] **Feed Header**: Counter of available spaces matching current criteria.
- [x] **Quick Locality Chips**: One-click filter pills for Satellite, Vastrapur, Prahlad Nagar, Navrangpura, Bopal.
- [x] **Listing Card Layout**:
  - Image thumbnail with category badge (`Fresh Flat`, `Replacement`, `Seeker`), rent badge (`₹X / month`), and verified shield.
  - Listing Title & Type.
  - Location pin with area/neighborhood text.
  - Furnishing status & occupancy badge.
  - Key amenities tags (WiFi, AC, Attached Bath, etc.).
  - Host avatar, name, and response badge (`Typically replies in minutes`).
  - Action: `"Interested"` button (opens `ExpressInterestModal`).
  - Action: `"Chat WhatsApp"` button (deep link to `wa.me/91...` with pre-filled message text).
  - Action: Save bookmark toggle (heart icon persisted to local storage / user profile).
  - Action: Flag / report button (opens `ReportModal`).
- [x] **Empty State**: Friendly illustration and "No listings found matching your filters" with clear button and prompt to list.

### 2.6. "How It Works" Section (`App.tsx:1234-1279`)
- [x] **Step 1**: Find & Filter (Browse verified listings by locality and budget).
- [x] **Step 2**: Connect Directly (Chat on WhatsApp with zero middlemen).
- [x] **Step 3**: Move In (Finalize rent agreement with zero brokerage).

### 2.7. "List Your Space" Multi-Tab Form (`App.tsx:1280-2176`)
- [x] **Form Tabs**:
  - Tab 1: Fresh Flat (Full Flat or Private Room).
  - Tab 2: Need Replacement (Shared Flat opening).
  - Tab 3: Seeker Requirement (Looking for flat/roommate).
- [x] **Inputs**:
  - Property Title & Locality (with auto-suggestion chips).
  - Monthly Rent & Deposit amounts.
  - BHK / Room Type selector.
  - Furnishing dropdown (Fully Furnished, Semi-Furnished, Unfurnished).
  - Occupancy / Availability status.
  - Tenant preference (Any, Bachelors, Family, Working Professionals).
  - Description textarea with character count.
  - Amenities multi-select chips + "Add Custom Amenity" text input.
  - Multi-photo upload selector with image preview thumbnails and delete buttons.
  - Host Contact details (Name and 10-digit WhatsApp phone number).
- [x] **Form Actions**:
  - Client-side validation for mandatory fields and 10-digit Indian mobile.
  - Content moderation check (profanity/scam keyword detection).
  - Anti-spam cooldown timer.
  - Instant submission feedback and listing confirmation state.

### 2.8. Why Flatemate Comparison Table (`App.tsx:2177-2220`)
- [x] Brokerage fees comparison: 0% vs 1-2 months rent.
- [x] Direct contact comparison: Direct WhatsApp vs Agent gatekeeping.
- [x] Verification comparison: Real room pictures & verified hosts.

### 2.9. Community Testimonials (`App.tsx:2221-2257`)
- [x] Authentic reviews from students and IT professionals in Ahmedabad (Satellite, SG Highway, Prahlad Nagar).

### 2.10. FAQ Accordion (`App.tsx:2258-2349`)
- [x] Collapsible accordion covering: Brokerage fee policy, listing safety, direct contact instructions, posting multiple rooms.

### 2.11. Pre-Footer Call to Action (`App.tsx:2350-2377`)
- [x] Vibrant indigo banner prompting seekers and hosts to get started.

### 2.12. Footer (`App.tsx:2378-2479`)
- [x] Flatemate logo, brand statement, copyright.
- [x] Ahmedabad Neighborhood Directory links (Satellite, Vastrapur, Bodakdev, Prahlad Nagar, Bopal, etc.).
- [x] Social / community links.

---

## 3. Modals & Interactive Overlays Parity

### 3.1. Listing Detail Modal (`App.tsx:2511-2670`)
- [x] Full-screen or centered backdrop modal showing complete listing specs.
- [x] Image gallery / photo carousel.
- [x] Full description, all amenities, rules, host profile.
- [x] Sticky action footer with "Interested" and "Chat WhatsApp" triggers.

### 3.2. Express Interest Modal (`ExpressInterestModal.tsx`)
- [x] Input fields: Seeker Full Name, 10-digit WhatsApp Number, Planned Move-in Date, Optional Note.
- [x] Auto-populates from saved guest session if previously entered.
- [x] Submits lead to database and transitions to `InterestSuccessModal`.

### 3.3. Interest Success Modal (`InterestSuccessModal.tsx`)
- [x] Confirmation checkmark with host contact card.
- [x] Direct "Continue to WhatsApp" button pre-configured with inquiry details.

### 3.4. Host Portal / My Listings Modal (`MyListingsModal.tsx`)
- [x] Host phone number lookup and active session identification.
- [x] Tab 1: "My Active Listings" with toggle to mark as `active` or `rented`.
- [x] Tab 2: "Inbound Leads / Inquiries" displaying seeker names, phone numbers, move-in dates, and status pills (`New`, `Contacted`, `Visited`).
- [x] Quick link to chat with inquiring seekers directly on WhatsApp.

### 3.5. Authentication Modal (`AuthModal.tsx`)
- [x] Toggle between "Login" and "Create Account".
- [x] Fields: Mobile Number or Email, Full Name (signup), Password with show/hide toggle.
- [x] Validation and friendly error messages.
- [x] Remembers session in browser state.

### 3.6. Report Listing Modal (`ReportModal.tsx`)
- [x] Reason radio options (Fake listing, Broker posing as owner, Already rented, Incorrect rent, Inappropriate content).
- [x] Additional comments textarea.
- [x] Submits report and hides listing from user's current view.

---

## 4. Functionality That Cannot Be Preserved Exactly (And Why)

To eliminate critical security and privacy flaws while preserving the exact user experience:

| Legacy Behavior | Security / Architectural Flaw | Preserved User-Facing Behavior in Next.js |
|---|---|---|
| **Global Inquiries Fetch (`SELECT * FROM inquiries` on page load)** | **Critical PII Leak**: Unauthenticated visitors could inspect network responses to read private phone numbers and notes of every seeker across all listings. | **Preserved UX, Secure Backend**: Seeking and host portals work identically. However, inquiry records are fetched via an authenticated server action or phone-verified query scoped strictly to `WHERE host_phone = $phone` or `host_id = auth.uid()`. Foreign inquiries are never exposed. |
| **Unauthenticated Status Mutation** | **Vulnerability**: Any visitor with the anon key could execute `UPDATE spaces SET status = 'rented'` on arbitrary listings. | **Preserved UX, Secure Backend**: Hosts can still toggle their listing status between `active` and `rented` with one click in "My Listings", but the update is validated on the server ensuring the requester owns the listing. |
| **Base64 Inline Images in Database** | **Bloat & Latency**: Raw Base64 strings up to several megabytes were stored directly in `spaces.image`, inflating database size and slowing page loads. | **Preserved UX, Modern Storage**: Listers still use the same file picker, see the same preview thumbnails, and see their images rendered on cards. Under the hood, photos are uploaded to a Supabase Storage bucket (`listing-photos`) and fast CDN URLs are stored. |
| **Client-Only Moderation & Cooldown** | **Bypassable**: Malicious users could bypass keyword checks and post spam at will by bypassing `localStorage`. | **Preserved UX, Dual-Layer Security**: The client provides the exact same instant feedback and cooldown countdown, while Next.js Server Actions validate the content server-side before database insertion. |
| **Unverified Synthetic Emails (`@flatemate.app`)** | **Fragile Auth**: Using fake emails without password reset capability created unrecoverable accounts. | **Preserved UX, Clean Auth**: Seamless mobile + password signup is preserved, while providing proper session management via Supabase Auth without forcing email verification blockers. |
