# Flatemate Legacy Reference

## Purpose
This directory contains the legacy web client source code and technical audit deliverables copied from the original application repository (`B:\Flatemate`).

It serves strictly as a **read-only historical and business logic reference** during the rebuild of the new production-grade Next.js website.

## Directory Contents
- `web/`: The original Vite + React 18 single-page application source code, mock data, and original SQL schema (`supabase_schema.sql`).
- `docs/audit/`: Complete Phase 0 and Phase 1 technical, security, UX, and architectural audit reports (`00_BASELINE.md` through `06_QUESTIONS_FOR_OWNER.md`).
- `docs/marketing_strategy.md`: Strategic product and UX specifications (trust badges, anti-ghosting indicators, lifestyle compatibility).

## Isolation & Production Safeguards
1. **Never Import**: Code in `website/` must NEVER import anything from `legacy-reference/`.
2. **Build Exclusion**: Build commands, bundlers, and deployment scripts for `website/` operate strictly within `website/` and will not process or package any files from `legacy-reference/`.
3. **No Secrets**: No `.env` files, credentials, or production database keys are present in this folder.
