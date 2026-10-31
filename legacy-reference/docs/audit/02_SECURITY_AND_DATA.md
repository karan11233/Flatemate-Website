# Flatemate — Phase 1: Security, Data & Privacy Audit

**Audit Date:** 2026-10-31  
**Scope:** Supabase Database, Authentication, Row-Level Security, Client Storage, Privacy Compliance (DPDP Act Readiness)

---

## 1. Row-Level Security (RLS) Policy Analysis

The database schema defined in `web/supabase_schema.sql` enables RLS on both tables, but creates completely permissive policies:

### Table: `public.spaces`
| Operation | Policy Name | Definition | Severity | Risk Assessment |
|---|---|---|---|---|
| **SELECT** | `"Public can view all spaces"` | `using (true)` | **Acceptable for Marketplace** | Necessary for public browsing of listings. |
| **INSERT** | `"Public can insert new spaces"` | `with check (true)` | **Medium Risk** | Allows guest/unauthenticated posting; susceptible to bot spam without server validation. |
| **UPDATE** | `"Public can update space status"` | `using (true)` | **CRITICAL** | Any client with the anon key can execute `UPDATE spaces SET status = 'rented'` or alter listing attributes for any row. |
| **DELETE** | *None defined* | Default deny | **Safe** | Deletions are blocked by default. |

### Table: `public.inquiries`
| Operation | Policy Name | Definition | Severity | Risk Assessment |
|---|---|---|---|---|
| **SELECT** | `"Public can view inquiries"` | `using (true)` | **CRITICAL** | Exposes private inquiries to all visitors. Leads can be scraped, harvested, or abused by third-party brokers. |
| **INSERT** | `"Public can insert new inquiries"` | `with check (true)` | **Low Risk** | Desirable for guests expressing interest, but needs rate limiting. |
| **UPDATE** | `"Public can update inquiry status"` | `using (true)` | **CRITICAL** | Any client can tamper with inquiry statuses across all users. |
| **DELETE** | *None defined* | Default deny | **Safe** | Deletions are blocked by default. |

---

## 2. Authentication & Identity Flow

### Current Implementation:
1. **Device ID Guest Identity** (`web/src/lib/supabase.ts:23-34`):
   - Generates random string `usr_...` stored in `localStorage.getItem('flatemate_device_user_id')`.
   - Allows frictionless posting without forcing authentication.
   - **Risk**: Losing `localStorage` (clearing browser data or switching devices) breaks ownership of previously posted listings.

2. **Pseudo-Email Authentication** (`web/src/lib/supabase.ts:39-46`):
   - Users registering with a 10-digit mobile number are registered under a synthesized email: `digits@flatemate.app`.
   - In `web/src/lib/supabase.ts:81`, the code instructs turning off "Confirm email" in Supabase Auth to allow instant signup without verification.
   - **Risk**: Fictitious mobile numbers can be claimed without SMS proof. No password reset flow exists for synthesized emails because the user does not control `@flatemate.app`.

3. **Client-Side Host Portal Lookup** (`web/src/components/MyListingsModal.tsx:55, 65`):
   - Any visitor can enter a phone number in the portal to display listings and inquiries belonging to that number.
   - Combined with the permissive RLS on `inquiries`, this enables unauthorized access to tenant leads.

---

## 3. Storage and Data Hygiene

1. **Missing Storage Bucket**:
   - There are no Supabase Storage buckets defined in `web/supabase_schema.sql`.
   - Photo uploads are handled via `FileReader.readAsDataURL()` and written directly into `spaces.image`.
   - **Consequence**:
     - Significant payload overhead (~33% expansion from Base64 encoding).
     - Database backups grow rapidly in size.
     - Potential HTTP payload truncation on slower networks.

2. **Loose Relational Constraints**:
   - `spaces.user_id`, `inquiries.host_id`, and `inquiries.seeker_id` are defined as `text` rather than foreign keys referencing `auth.users(id)`.
   - Cascading actions, orphaned records, and referential integrity are not maintained at the database engine level.

---

## 4. Privacy & Indian DPDP Act Compliance Readiness

Under India's Digital Personal Data Protection (DPDP) Act, platforms collecting Personally Identifiable Information (PII) must adhere to purpose limitation, data minimization, and access control:

1. **PII Collected**: Full names, 10-digit phone numbers, personal notes, move-in dates, and prospective tenant profiles.
2. **Current Deficiencies**:
   - **Data Exposure**: Inquiries containing visitor PII are publicly readable via Supabase client queries.
   - **Notice & Consent**: The site lacks a dedicated Privacy Notice outlining data processing, retention terms, and user rights.
   - **Right to Erasure / Deletion**: No mechanism exists for users to delete their account, purge posted listings, or wipe their submitted inquiries.

---

## 5. Non-Destructive Validation & Remediation Plan

To remediate security vulnerabilities without interrupting live users:

### Step 1: Secure RLS Policies (Staging Validation First)
```sql
-- 1. Restrict listing updates to the listing creator
create policy "Owners can update their own spaces"
  on public.spaces for update
  using (auth.uid()::text = user_id);

-- 2. Restrict inquiry visibility to the target host and inquiring seeker
create policy "Hosts and seekers can view their own inquiries"
  on public.inquiries for select
  using (
    auth.uid()::text = host_id 
    or auth.uid()::text = seeker_id
  );

-- 3. Restrict inquiry status updates to the listing host
create policy "Hosts can update inquiry status"
  on public.inquiries for update
  using (auth.uid()::text = host_id);
```

### Step 2: Implement Secure Image Storage
- Create a dedicated Supabase public storage bucket: `listing-photos`.
- Set an RLS storage policy: authenticated users can upload; public can view.
- Store CDN public URLs in `spaces.image` instead of Base64 strings.

### Step 3: Production Backup & Rollback Prerequisites
Before applying any migration:
1. Export current database data via Supabase dashboard (`Database -> Backups` or pg_dump).
2. Validate the migration script on a separate staging Supabase project.
3. Ensure client backward compatibility so existing listings with Base64 images continue to render cleanly.
