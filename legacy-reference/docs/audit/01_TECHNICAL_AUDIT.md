# Flatemate — Phase 1: Technical Audit

**Audit Date:** 2026-10-31  
**Auditor Mode:** Read-Only Static & Build Analysis  
**Target:** Monorepo (`B:\Flatemate`) covering Web (`/web`) & Mobile (`/src`)

---

## 1. Executive Summary

Flatemate is an operational web and mobile application targeting roommate discovery and shared apartment rental in India, currently focused on Ahmedabad. The web platform is deployed on Netlify (`https://flatemate-ahmedabad.netlify.app/`) using a Vite + React 18 SPA backed by Supabase PostgreSQL. The mobile counterpart is built with Expo / React Native and Firebase.

While the user interface is functional and provides zero-brokerage direct WhatsApp connections, the technical audit reveals critical security and architectural risks that must be resolved prior to pan-India scaling or production migration:
1. **Critical Data Exposure**: Row-Level Security policies in `supabase_schema.sql` are completely permissive (`using (true)`), allowing unauthenticated visitors to fetch all user inquiries, mobile numbers, and lead notes directly into browser memory.
2. **Monolithic Architecture**: The core web client (`web/src/App.tsx`) is a 2,694-line monolithic file that bundles routing, UI components, forms, and state, while modularized components in `web/src/components/` remain largely unmounted.
3. **Hardcoded Fallback Credentials**: Supabase project endpoints and anonymous public keys are embedded directly in source code (`web/src/lib/supabase.ts:5-6`).
4. **Base64 Direct Storage**: Property photos are uploaded as Base64 strings and stored directly in database text columns rather than Supabase Storage buckets.
5. **Geographic Tight Coupling**: Locality search, filters, validation, and copy are hardcoded exclusively to Ahmedabad neighborhoods, lacking a normalized schema for nationwide multi-city expansion.

---

## 2. Verified Technology Stack

| Domain | Mobile App (`/src`) | Web Application (`/web`) |
|---|---|---|
| **Framework** | React Native 0.88.0 (Expo 58.0.0) | React 18.3.1 (Vite 6.1.0) |
| **Language** | TypeScript 6.0.3 (strict mode) | TypeScript 5.7.3 (strict mode) |
| **Styling** | React Native StyleSheet / Custom Theme | Tailwind CSS 3.4.17 + PostCSS |
| **Icons** | `@expo/vector-icons` + Custom SVGs | Lucide React 0.475.0 + Iconify CDN |
| **Backend / DB** | Firebase 12.14.0 (Auth & Firestore) | Supabase Cloud (PostgreSQL 15+) |
| **Auth Engine** | Firebase Auth (`src/Context/AuthContext.tsx`) | Supabase GoTrue + LocalStorage Device ID |
| **Hosting** | Native builds (Android / iOS) | Netlify (Static SPA + Redirects) |
| **State / Store** | React Context (`AuthContext`, `ChatContext`) | Local React State + LocalStorage |
| **Testing** | 1 basic Jest test (`__tests__/App.test.tsx`) | 0 automated tests |

---

## 3. Product & Feature Inventory Matrix

| Feature | Status | Implementation Evidence / Notes |
|---|---|---|
| **Landing Page & Hero** | **IMPLEMENTED** | `web/src/App.tsx:580-680` — Functional hero, value props, statistics, and quick-filter CTA. |
| **Locality / Area Search** | **PARTIAL** | `web/src/App.tsx:830-860` — Hardcoded exclusively to Ahmedabad areas (Satellite, Vastrapur, Bopal, etc.). No pan-India city selector. |
| **Budget & Category Filters** | **IMPLEMENTED** | `web/src/App.tsx:850-890` — Filter by rent range and category (`fresh`, `replacement`, `seeker`). |
| **Direct WhatsApp Deep Linking**| **IMPLEMENTED** | `web/src/App.tsx:1203`, `2602` — Pre-filled click-to-chat links (`wa.me/91...`). |
| **Listing Creation (CRUD)** | **PARTIAL** | `web/src/App.tsx:1430-2200` — Create and view active listings. Edit and delete operations are missing; only toggle between `active` and `rented` is supported. |
| **Photo Uploads** | **PARTIAL** | `web/src/App.tsx:225-238` — Multi-photo selection converts files to Base64 data URLs. No Supabase Storage bucket integration. |
| **User Sign-up / Login** | **PARTIAL** | `web/src/components/AuthModal.tsx:32-110` — Password auth supported. Phone signups append `@flatemate.app`. No real SMS OTP verification. |
| **Saved Listings** | **IMPLEMENTED** | `web/src/App.tsx:193, 212-216` — LocalStorage-persisted bookmarks. |
| **Lead / Inquiry Management** | **IMPLEMENTED** | `web/src/components/MyListingsModal.tsx:50-130` — Host portal lists inbound leads by host phone/ID. |
| **Abuse Reporting** | **PARTIAL** | `web/src/components/ReportModal.tsx` & `web/src/App.tsx:218-224` — Client-side modal logs reports to `console.log` and `localStorage`. No database table or admin alert. |
| **Lifestyle Compatibility Match** | **MISSING (Web)** | Outlined in `marketing_strategy.md:43-55` and mobile types, but completely missing from web UI. |
| **Digital Rent Agreements** | **IMPLEMENTED (Mobile Only)** | `src/Screens/RentAgreementCabinet.tsx`, `AgreementForm.tsx`. Missing on web. |
| **Admin Moderation Portal** | **MISSING** | No admin routes, role checks, or listing approval queues exist in the codebase. |

---

## 4. Technical Findings by Severity

### CRITICAL SEVERITY

#### Finding C-01: Full Database Inquiry Exposure via Permissive RLS
- **Evidence**: `web/supabase_schema.sql:71-73`
  ```sql
  create policy "Public can view inquiries" 
    on public.inquiries for select 
    using (true);
  ```
- **Evidence in Client**: `web/src/App.tsx:286-289`
  ```typescript
  const cloudInquiries = await getCloudInquiries();
  if (cloudInquiries) {
    setInquiries(cloudInquiries);
  }
  ```
- **Risk**: Any visitor's browser executes a `SELECT * FROM inquiries` on initial page load, downloading all leads across all listings into memory. This includes personal full names, raw mobile numbers, move-in dates, and private notes.
- **Remediation**: Restrict the `inquiries` select policy to authenticated hosts whose `auth.uid() = host_id`. Remove the global client-side fetch of all inquiries.

---

#### Finding C-02: Public Mutation of Listing and Inquiry States
- **Evidence**: `web/supabase_schema.sql:67-69, 79-81`
  ```sql
  create policy "Public can update space status" 
    on public.spaces for update 
    using (true);

  create policy "Public can update inquiry status" 
    on public.inquiries for update 
    using (true);
  ```
- **Risk**: Any unauthenticated client or automated script can send an `UPDATE spaces SET status = 'rented'` or mutate inquiry records arbitrarily using the anon key.
- **Remediation**: Enforce ownership checks (`auth.uid() = user_id`) on all SQL `UPDATE` and `DELETE` operations.

---

### HIGH SEVERITY

#### Finding H-01: Hardcoded Fallback Credentials in Client Code
- **Evidence**: `web/src/lib/supabase.ts:5-6`
  ```typescript
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upckzykqjnugdyvlynvq.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_...';
  ```
- **Risk**: Project credentials are baked into client git history and public bundles. While anon keys are intended to be public, pairing an anon key with wide-open RLS policies provides full write/read access to the database.
- **Remediation**: Inject credentials exclusively through Netlify/Vite environment variables; remove hardcoded project identifiers from repository files.

---

#### Finding H-02: Base64 Images Stored Directly in Database Rows
- **Evidence**: `web/src/App.tsx:236` and `web/src/App.tsx:413-414`
  ```typescript
  reader.readAsDataURL(file);
  const chosenImage = uploadedPhotos.length > 0 ? uploadedPhotos[0] : ...
  ```
- **Risk**: Storing raw Base64 strings in the `spaces.image` text column causes massive database bloat, slows query times, and leads to client performance degradation.
- **Remediation**: Implement Supabase Storage (`storage.from('listing-images').upload(...)`) with authenticated upload policies and store clean CDN URLs.

---

#### Finding H-03: Insecure Phone Lookup in Host Portal
- **Evidence**: `web/src/components/MyListingsModal.tsx:55, 65`
  ```typescript
  if (currentPhone && s.hostPhone && s.hostPhone.replace(/\D/g, '').endsWith(currentPhone.replace(/\D/g, '').slice(-10))) return true;
  ```
- **Risk**: Because all inquiries and spaces are downloaded into client state, any visitor can enter another user's 10-digit mobile number into the host portal input and immediately view that person's listings and leads.
- **Remediation**: Require verified session authentication before querying user-owned listings and leads.

---

### MEDIUM SEVERITY

#### Finding M-01: Client-Side-Only Moderation & Cooldown
- **Evidence**: `web/src/lib/moderation.ts:23-48, 89-105`
- **Risk**: Content moderation (profanity, scam links) and post cooldown limits are enforced purely in the browser. Anyone invoking the Supabase API directly can bypass all filters.
- **Remediation**: Add PostgreSQL triggers, check constraints, or an edge function / serverless API route to validate content prior to insertion.

---

#### Finding M-02: Hardcoded Geographic Locality Model
- **Evidence**: `web/src/App.tsx:409-411, 837-845, 963-978`
- **Risk**: City name (`Ahmedabad`) is appended automatically, and area chips are statically bound. Expanding to Bengaluru, Pune, Delhi NCR, or Mumbai is impossible without refactoring the schema and UI.
- **Remediation**: Introduce normalized `cities` and `localities` tables or columns in Supabase.

---

#### Finding M-03: Monolithic Component Architecture & Dead Code
- **Evidence**: `web/src/App.tsx` (2,694 lines) vs unmounted components in `web/src/components/FlatCard.tsx`, `HeroSection.tsx`, `FilterBar.tsx`, etc.
- **Risk**: High maintenance overhead, elevated risk of regression, and large initial bundle payload (502 kB minified chunk).
- **Remediation**: Decompose `App.tsx` into modular feature components and remove dead code.

---

### LOW SEVERITY

#### Finding L-01: Missing Root Lint Command Dependency
- **Evidence**: Root `package.json:12` specifies `"lint": "eslint ."`, but `eslint` is absent from `devDependencies`, causing the command to fail.
- **Remediation**: Install ESLint in root `devDependencies` or align lint scripts across workspaces.

---

#### Finding L-02: Single-Page SEO Limitation
- **Evidence**: `web/public/sitemap.xml` contains only 1 URL (`/`). Individual listings and neighborhood pages cannot be uniquely indexed or shared with custom OpenGraph metadata.
- **Remediation**: Introduce server-side or dynamic pre-rendering for listing detail and city landing pages.
