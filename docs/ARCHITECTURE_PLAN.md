# Flatemate Website — Parity-First Architecture Plan

## 1. Migration Philosophy: Zero Visual Disruption
This rebuild is **NOT** a redesign. The primary directive is **100% fidelity to the existing Flatemate website**:
- **Preserve**: Visual design, page structure, color palette, typography, micro-interactions, copy, listing cards, form workflows, filter dropdowns, WhatsApp click-to-chat links, and mobile responsiveness.
- **Modernize**: Under-the-hood technology stack (Vite SPA -> Next.js 15+ App Router, TypeScript, Tailwind CSS, shadcn/ui component architecture).
- **Harden**: Database security, Row-Level Security (RLS) enforcement, Supabase Storage for property images, and secure server-side mutations.
- **Elevate**: Performance, SEO with Server-Side Rendering (SSR), structured data (JSON-LD), and dynamic WhatsApp social preview cards.

---

## 2. Technology Stack & Parity Mapping

| Layer | Legacy Implementation (`legacy-reference/`) | Modern Implementation (`website/`) | Rationale / Benefits |
|---|---|---|---|
| **Framework** | Vite 6.1 + React 18 SPA | Next.js 15+ (App Router) + React 19 | SSR for instant crawling and fast LCP; Server Components reduce client bundle size. |
| **Language** | TypeScript 5.7 (monolithic) | TypeScript 5.7+ (strict mode, modular interfaces) | Strict typing across all components, API schemas, and database queries. |
| **Styling** | Tailwind CSS 3.4 (custom root variables) | Tailwind CSS + CSS variables matching legacy tokens | 100% identical styling tokens (`#4F46E5`, `#F8FAFC`, `#10B981`, `#EEF2FF`). |
| **UI Components** | Monolithic inline JSX in `App.tsx` | Modular component hierarchy styled to match legacy UI exactly | Clean separation of concerns, testability, and reuse. |
| **Icons** | Lucide React + Iconify CDN | Lucide React (bundled SVG, zero CDN network latency) | Eliminates external render-blocking scripts. |
| **Backend & Database** | Supabase PostgreSQL (wide-open RLS) | Fresh Supabase Project with hardened RLS policies | Complete privacy for user leads, inquiries, and ownership. |
| **Media Storage** | Base64 strings in database rows | Supabase Storage (`listing-photos` bucket) | High performance, CDN caching, no database bloat. |
| **SEO & Social Cards**| Static client index.html (Ahmedabad only) | Dynamic SSR metadata + OpenGraph image generation | Every listing and locality generates rich preview cards on WhatsApp/Twitter. |

---

## 3. Directory Layout (`B:\Flatemate-Website\website`)

```
website/
├── app/
│   ├── layout.tsx              # Root layout (fonts, header, mobile bottom nav, footer)
│   ├── page.tsx                # Main landing & feed page (identical to current App.tsx)
│   ├── listing/[id]/           # Server-rendered detail view for direct sharing & SEO
│   ├── sitemap.ts              # Dynamic sitemap for all active listings and localities
│   ├── robots.ts               # Crawler directives
│   └── globals.css             # Tailwind & design token variables
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Top navigation bar with logo, nav links, auth, and CTAs
│   │   ├── Footer.tsx          # Comprehensive footer with Ahmedabad locality links
│   │   └── MobileBottomNav.tsx # Sticky bottom navigation for mobile viewports
│   ├── sections/
│   │   ├── HeroSection.tsx     # Eyebrow, headline, CTAs, trust metrics, and hero graphic
│   │   ├── CategoryCards.tsx   # Fresh Flats, Replacements, Roommate Seekers cards
│   │   ├── FilterBar.tsx       # Category tabs, Locality dropdown, and Budget dropdown
│   │   ├── ListingFeed.tsx     # Area chips, listing cards grid, and empty states
│   │   ├── HowItWorks.tsx      # 3-step process guide
│   │   ├── ListSpaceSection.tsx# 3-tab listing creation form with photo uploader
│   │   ├── ComparisonTable.tsx # Why Flatemate vs traditional brokers
│   │   ├── Testimonials.tsx    # Resident and seeker reviews
│   │   ├── FAQSection.tsx      # Accordion FAQ
│   │   └── PreFooterCTA.tsx    # High-impact indigo CTA banner
│   ├── cards/
│   │   ├── ListingCard.tsx     # Card matching legacy layout, badges, price, and actions
│   │   └── ListingCardSkeleton.tsx # Smooth loading skeleton state
│   └── modals/
│       ├── ListingDetailModal.tsx # Full listing specification overlay
│       ├── ExpressInterestModal.tsx # Inquire with move-in date and note
│       ├── InterestSuccessModal.tsx # WhatsApp continuation dialog
│       ├── MyListingsModal.tsx      # Host management portal (listings & inbound leads)
│       ├── AuthModal.tsx            # Login and Sign-up modal
│       └── ReportModal.tsx          # Community moderation modal
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client for auth state and realtime
│   │   ├── server.ts           # Server client for secure server actions and SSR queries
│   │   └── storage.ts          # Image upload helper targeting Supabase Storage
│   └── moderation.ts           # Profanity and scam validation (dual client + server)
├── types/
│   └── index.ts                # Strict TypeScript interfaces matching legacy definitions
└── public/
    └── assets/                 # Brand logos, icons, and hero photography
```

---

## 4. Hardened Security & Database Architecture

### 4.1. Fresh Supabase Schema
The database schema will be recreated cleanly in the new Supabase project:

1. **`spaces` (Listings)**:
   - `id`: `text` or `uuid` primary key.
   - `user_id`: `uuid references auth.users(id)` (or device identifier for guests).
   - `listing_category`: `'fresh' | 'replacement' | 'seeker'`.
   - `type`, `rent`, `raw_rent`, `location`, `city`, `furnishing`, `occupancy`.
   - `image`: URL string pointing to Supabase Storage.
   - `host_name`, `host_phone`, `description`, `amenities`.
   - `status`: `'active' | 'rented'`.
   - `created_at`: timestamp with timezone.

2. **`inquiries` (Tenant Leads)**:
   - `id`: primary key.
   - `space_id`: foreign key references `spaces(id) on delete cascade`.
   - `host_id`, `seeker_id`: user references.
   - `host_name`, `host_phone`, `seeker_name`, `seeker_phone`.
   - `move_in_date`, `note`, `timestamp`, `status` (`'new' | 'contacted' | 'visited'`).

3. **`reports` (Moderation Queue)**:
   - Dedicated table for user reports replacing legacy `console.log` behavior.

### 4.2. Row-Level Security (RLS) Rules
- **Public Read on Spaces**: Anyone can query `WHERE status = 'active'`.
- **Owner-Only Space Mutations**: `UPDATE` and `DELETE` on `spaces` require ownership verification.
- **Private Inquiries**: `SELECT` on `inquiries` is strictly limited to `auth.uid() = host_id OR auth.uid() = seeker_id` (or verified host phone via a secure Server Action). Global inquiry scraping is entirely blocked.

---

## 5. Phased Implementation Strategy

- **Phase A — Project Scaffold & Design Tokens**: Initialize Next.js 15+ in `website/`, configure Tailwind CSS and fonts to match legacy visual tokens 1:1, port public brand assets.
- **Phase B — Section-by-Section Modular UI**: Reconstruct the header, hero, category cards, filter bar, feed, forms, and footer with pixel-level fidelity to `App.tsx`.
- **Phase C — Modal Overlays & Interactive States**: Implement all modals (`ListingDetailModal`, `ExpressInterestModal`, `InterestSuccessModal`, `MyListingsModal`, `AuthModal`, `ReportModal`).
- **Phase D — Secure Supabase Integration**: Connect fresh Supabase project, execute secure schema and RLS policies, implement Supabase Storage photo uploads.
- **Phase E — SSR, Dynamic OpenGraph & Verification**: Add dynamic listing routes, generate sitemaps, verify responsive behavior and WhatsApp click-to-chat parity.
