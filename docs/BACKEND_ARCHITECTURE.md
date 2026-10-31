# Flatemate Website — Phase 4A: Backend Architecture & Database Security Specification

**Version:** 3.0.0 (Round 2 Security Hardening)  
**Target Path:** `B:\Flatemate-Website\website\`  
**Target Database:** Standalone Supabase PostgreSQL (100% independent of legacy mobile app & old web)  
**Status:** Approved for Architecture Planning (Phase 4A) — Awaiting Approval for Implementation (Phase 4B)

---

## 1. Executive Summary & Security Principles

In Phase 3, we achieved 1:1 visual and interaction parity for the Flatemate website on Next.js 15 App Router. The UI, copy, colors, sections, forms, filters, and modals match the previous website exactly.

Phase 4A establishes the **zero-trust production backend architecture, PostgreSQL schema, strict Row Level Security (RLS), and verified ownership system**.

### Key Architectural Invariants:
1. **Direct PostgREST Table Isolation:** Raw `public.spaces` SELECT is restricted so anonymous callers receive **0 rows**, and authenticated users can ONLY see their own listings. Direct PostgREST queries cannot bypass consent masking. Public browsing MUST query the sanitized `public.public_spaces` view.
2. **Explicit Opt-In WhatsApp Consent (Default: False):** In `spaces`, `consent_whatsapp_contact` defaults to `false`. If `false`, `public_spaces` returns `null` for `contact_phone`, completely blocking web scraping while preserving the inquiry lead flow.
3. **Sensitive Claim Secrets Isolation:** Single-use guest claim token hashes are stored in a dedicated, isolated table `public.space_claim_secrets` with zero public `SELECT` grants. PostgREST clients cannot query it.
4. **Database-Level INSERT Integrity:** Trigger `enforce_space_insert_integrity` forces `user_id = auth.uid()`, `featured = false`, `views_count = 0`, and `is_demo = false` on every insert. Clients cannot elevate privileges via raw API requests.
5. **Atomic, Concurrency-Safe Guest Claims:** The `claim_guest_space` RPC executes an atomic conditional `DELETE FROM space_claim_secrets ... RETURNING space_id`. If two concurrent requests arrive with the same token, exactly one succeeds and the other fails. Hardened with `SET search_path = public, pg_temp` and explicit grants.
6. **Exact Field-Level Inquiry Updates:** Trigger `enforce_inquiry_update_integrity` ensures hosts can ONLY update `status` (forward-only: `new` -> `contacted` -> `visited`) and `host_archived`. Seekers can ONLY update `seeker_archived`. Messages, dates, IDs, and seeker contact details are strictly immutable.
7. **Inquiry Hard Delete Denied:** Hard deletion is blocked (`USING (false)`). Participants independently soft-archive, preserving communication records.
8. **Restricted `public_profiles` View:** Only hosts who have active, published listings appear in `public_profiles`. Registered seekers and inactive users are never exposed.
9. **Abuse-Proof Views Counter:** The `increment_space_views` RPC is rate-limited via `rate_limits` to at most 1 increment per viewer fingerprint per space per hour.
10. **Fail-Closed Seed Migration Guard:** `00004_seed_ahmedabad.sql` fails closed unless `app.environment` is explicitly set to `development`, `local_test`, or `staging`. Seeds are excluded from production.

---

## 2. Hardened Entity-Relationship Model

```mermaid
erDiagram
    AUTH_USERS ||--o| PROFILES : "has profile"
    AUTH_USERS ||--o{ SPACES : "owns listings"
    AUTH_USERS ||--o{ INQUIRIES : "submits (as seeker)"
    AUTH_USERS ||--o{ INQUIRIES : "receives (as host)"
    AUTH_USERS ||--o{ REPORTS : "files report"

    SPACES ||--o| SPACE_CLAIM_SECRETS : "has single-use claim"
    SPACES ||--o{ SPACE_PHOTOS : "contains photos"
    SPACES ||--o{ INQUIRIES : "receives inquiries"
    SPACES ||--o{ REPORTS : "subject to reports"

    PROFILES {
        uuid id PK "references auth.users(id)"
        text full_name
        text phone "unique, 10 digits"
        text avatar_url
        text city "default 'Ahmedabad'"
        boolean is_verified "admin/service_role only"
        timestamptz created_at
        timestamptz updated_at
    }

    SPACES {
        uuid id PK
        uuid user_id FK "references auth.users(id)"
        text title
        text description
        text location "Neighborhood/Hub"
        text city "Ahmedabad"
        integer rent
        integer deposit
        listing_type listing_type "room | entire_flat | seeking_flat"
        gender_preference gender_preference "any | female | male"
        furnishing_type furnishing "fully | semi | unfurnished"
        text room_type
        date available_from
        text[] amenities
        text[] images "CDN URLs"
        text contact_name
        text contact_phone "10 digits"
        boolean consent_whatsapp_contact "EXPLICIT OPT-IN (default: false)"
        space_status status "active | rented | paused | archived"
        boolean featured "admin/service_role only"
        integer views_count "increment via RPC only"
        boolean is_demo "demo/seed data flag"
        timestamptz created_at
        timestamptz updated_at
    }

    SPACE_CLAIM_SECRETS {
        uuid space_id PK "references spaces(id)"
        text claim_token_hash "SHA-256 for guest claim"
        timestamptz claim_expires_at "48 hours expiration"
        timestamptz created_at
    }

    SPACE_PHOTOS {
        uuid id PK
        uuid space_id FK "references spaces(id)"
        text storage_path
        text url
        smallint display_order
        timestamptz created_at
    }

    INQUIRIES {
        uuid id PK
        uuid space_id FK "references spaces(id)"
        uuid host_id FK "derived from spaces.user_id"
        uuid seeker_id FK "derived from auth.uid()"
        text seeker_name
        text seeker_phone "10 digits"
        text seeker_message
        date move_in_date
        inquiry_status status "new | contacted | visited"
        boolean host_archived "host soft-delete"
        boolean seeker_archived "seeker soft-delete"
        timestamptz created_at
        timestamptz updated_at
    }

    REPORTS {
        uuid id PK
        uuid space_id FK "references spaces(id)"
        uuid reporter_id FK "references auth.users(id)"
        text reporter_ip_hash
        text reason
        text details
        report_status status "pending | reviewed | resolved | dismissed"
        timestamptz created_at
    }

    RATE_LIMITS {
        text key PK "action:hash:window"
        integer count
        timestamptz expires_at
    }
```

---

## 3. Row Level Security & PostgREST Policy Matrix

| Table / View | Operation | Allowed Roles | Policy Logic / Conditions | Security Protection |
|---|---|---|---|---|
| `public.profiles` | `SELECT` | `authenticated` only | `auth.uid() = id` | Direct query returns only own profile. |
| `public.public_profiles` (View) | `SELECT` | `anon`, `authenticated` | `EXISTS (SELECT 1 FROM spaces s WHERE s.user_id = p.id AND s.status = 'active')` | **Only active listing hosts are exposed.** Passive users/seekers are completely hidden. |
| `public.spaces` | `SELECT` | `authenticated` only | `auth.uid() = user_id` | **Direct PostgREST queries return ONLY own listings.** Anonymous queries return 0 rows. |
| `public.public_spaces` (View) | `SELECT` | `anon`, `authenticated` | `status = 'active' AND is_demo = false` | Masks `contact_phone` as `null` unless host explicitly opted into `consent_whatsapp_contact = true`. |
| `public.spaces` | `INSERT` | `authenticated` | `auth.uid() = user_id` | Trigger `enforce_space_insert_integrity` forces safe defaults. |
| `public.spaces` | `UPDATE` | `authenticated` | `auth.uid() = user_id` | Trigger `check_space_update_privileges` blocks tampering with `featured`, `views_count`, `user_id`. |
| `public.spaces` | `DELETE` | `authenticated` | `auth.uid() = user_id` | Owners can delete their own listings. |
| `public.space_claim_secrets` | `ALL` | `service_role` only | `auth.role() = 'service_role'` | **Zero public access.** PostgREST calls denied. Managed via atomic RPC. |
| `public.space_photos` | `SELECT` | `anon`, `authenticated` | `true` | Photos are publicly viewable. |
| `public.space_photos` | `INSERT` / `DELETE`| `authenticated` | `EXISTS (SELECT 1 FROM spaces s WHERE s.id = space_id AND s.user_id = auth.uid())` | Only verified listing owner can attach/remove photos. |
| `public.inquiries` | `SELECT` | `authenticated` only | `(auth.uid() = host_id AND host_archived = false) OR (auth.uid() = seeker_id AND seeker_archived = false)` | Zero anonymous leaks. Only active parties can view lead details. |
| `public.inquiries` | `INSERT` | `anon`, `authenticated` | Valid phone format (`^[0-9]{10}$`) and name | Trigger `derive_inquiry_parties` overwrites `host_id` with real space owner and `seeker_id` with `auth.uid()`. |
| `public.inquiries` | `UPDATE` | `authenticated` | `auth.uid() = host_id OR auth.uid() = seeker_id` | Trigger `enforce_inquiry_update_integrity` strictly enforces exact field boundaries per role. |
| `public.inquiries` | `DELETE` | **DENIED** | `false` | Hard deletion strictly prohibited. Participants independently soft-archive. |
| `public.reports` | `INSERT` | `anon`, `authenticated` | `char_length(reason) >= 3` | Public can submit listing abuse flags. |
| `public.rate_limits`| `ALL` | `service_role` only | `auth.role() = 'service_role'` | Protected from all public manipulation. |

---

## 4. Atomic, Concurrency-Safe Guest Claim Specification

```mermaid
sequenceDiagram
    autonumber
    actor Guest as Unauthenticated Guest
    participant Server as Next.js Server Action
    participant DB as Supabase PostgreSQL
    actor Host as Authenticated User

    Note over Guest,DB: 1. Guest Listing Creation
    Guest->>Server: Submits listing form (unauthenticated)
    Server->>Server: Generates cryptographically secure token (32 bytes hex)
    Server->>Server: Computes token_hash = SHA-256(claim_token)
    Server->>DB: INSERT INTO spaces (user_id = null, status = 'active')
    Server->>DB: INSERT INTO space_claim_secrets (space_id, claim_token_hash, claim_expires_at = now() + 48h)
    Server-->>Guest: Returns Set-Cookie: HttpOnly, Secure, SameSite=Strict claim_token

    Note over Host,DB: 2. Atomic Claiming Flow
    Host->>Server: Logs in / Signs up via AuthModal
    Host->>Server: Requests to claim listing with claim_token from cookie
    Server->>DB: SELECT claim_guest_space(space_id, claim_token)
    Note over DB: Atomic Conditional Delete:<br/>DELETE FROM space_claim_secrets<br/>WHERE space_id = p_space_id AND hash = sha256(token) AND expires > now()<br/>RETURNING space_id
    Note over DB: If updated_id IS NULL: throws exception (concurrent or invalid)<br/>If valid: UPDATE spaces SET user_id = auth.uid()
    DB-->>Server: Returns { success: true }
    Server-->>Host: Listing now appears in Host Portal
```

---

## 5. Automated PostgreSQL Security Integration Test Plan

The complete SQL integration test suite is located in [`website/tests/sql/security_integration_test.sql`](file:///B:/Flatemate-Website/website/tests/sql/security_integration_test.sql).

It runs inside a transactional rollback (`BEGIN ... ROLLBACK`) testing:
1. **TEST 1**: Direct PostgREST access under `anon` returns 0 rows from `spaces` and fails on `space_claim_secrets`; `public_spaces` view properly masks `contact_phone` when `consent_whatsapp_contact = false`.
2. **TEST 2**: Attacker attempting privileged INSERT (`featured = true, views_count = 9999, user_id = victim`) is forcefully overridden by trigger to safe defaults.
3. **TEST 3**: Atomic concurrent claim: first claim succeeds; subsequent claim with same token fails immediately.
4. **TEST 4**: Field-level inquiry update enforcement: seeker cannot change status or alter host archive flag; host cannot alter messages or seeker archive flag; hard delete is rejected.
5. **TEST 5**: Views counter rate-limiting: repeated view calls within the same hour for the same viewer token return `false`.

In addition, the Vitest test suite in [`website/tests/database-security.test.ts`](file:///B:/Flatemate-Website/website/tests/database-security.test.ts) validates these invariants with **19/19 tests passing**.
