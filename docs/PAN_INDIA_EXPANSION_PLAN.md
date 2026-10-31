# Flatemate Website — Pan-India Expansion Plan (Future Phase)

## Context & Scope Boundary
Per the project mandate, the active Phase 2 and Phase 3 deliverables maintain **100% fidelity to the existing live Ahmedabad marketplace**.

All pan-India multi-city extensions are documented here as a **separate future phase** to be executed only after complete Ahmedabad parity and verification.

---

## 1. Schema Preparation for Nationwide Scale
When approved for nationwide rollout, the database schema will transition from simple text locations to structured geographic entities:

```sql
-- Cities reference table
create table public.cities (
  id text primary key,
  name text not null unique,
  state text not null,
  slug text not null unique,
  lat numeric,
  lng numeric,
  active boolean default false
);

-- Supported tier-1 metro launch list:
-- 1. Ahmedabad (Active - Launch Market)
-- 2. Bengaluru (Phase Next)
-- 3. Pune (Phase Next)
-- 4. Mumbai (Phase Next)
-- 5. Delhi NCR (Phase Next)
-- 6. Hyderabad (Phase Next)
```

---

## 2. Dynamic City Routing Structure
The Next.js App Router will support city-specific landing pages and localized SEO hubs:
- `/[city]` (e.g. `/ahmedabad`, `/bengaluru`, `/pune`)
- `/[city]/flats` (e.g. `/bengaluru/flats?locality=koramangala`)
- `/[city]/roommates` (e.g. `/pune/roommates?budget=15000`)
- `/listing/[id]` (Permanent canonical listing URL with dynamic OpenGraph meta tags)

---

## 3. Launch Sequence & Feature Gates
1. **Gate 1**: Full launch and stability verification of the rebuilt Ahmedabad platform on production custom domain.
2. **Gate 2**: Schema migration introducing `city` and `locality` columns without altering legacy Ahmedabad rows.
3. **Gate 3**: Staging validation of Bengaluru and Pune localized landing pages.
4. **Gate 4**: Marketing campaigns and multi-city host acquisition.
