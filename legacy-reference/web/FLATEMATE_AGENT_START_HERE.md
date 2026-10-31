# FLATEMATE — ONE-FILE AGENT PLAYBOOK

**Purpose:** Paste or upload this ONE file into the root of the existing Flatemate source-code project, then ask your coding agent: **“Read FLATEMATE_AGENT_START_HERE.md and execute Phase 0 and Phase 1 only. Stop for my approval.”**

**Project context (confirm, do not assume implementation details):** Existing public site: https://flatemate-ahmedabad.netlify.app/ ; currently deployed on Netlify; owner reports Supabase backend/database; intended expansion across India; considering Hostinger for domain and hosting. Goal: production-quality modernization while preserving the live site, existing users, data, URLs where practical, and working features.

## Non-negotiable agent operating rules

1. **Audit first. No code changes in Phase 0–1.** Read files and report. Do not install dependencies, run mutating scripts, modify configuration, deploy, touch production data, or commit changes during audit. You may run non-mutating local inspection commands. Ask permission before any command whose effects are uncertain.
2. **Never expose secrets.** Do not print, copy into reports, commit, or send environment variable values, API keys, tokens, service-role keys, database URLs, passwords, or user personal data. Refer to secret *names* only. Never use production credentials for tests.
3. **No automatic destructive operations.** Never drop tables, reset Supabase, overwrite storage, rotate keys, switch DNS, cancel Netlify, delete users, or execute migrations against production without separate explicit owner approval and a verified rollback plan.
4. **Evidence over assumptions.** For every material finding, cite file paths and line numbers where possible. If an item needs dashboard access or live testing, mark it **NOT VERIFIED** and request the minimal access or sanitized evidence needed. Do not claim a live site inspection equals a code audit.
5. **Preserve behavior.** Inventory every existing feature and API before proposing changes. Keep a feature-parity checklist. Avoid an unnecessary rewrite if incremental improvement is safer.
6. **Approval gates.** At the end of each phase, stop and ask for owner approval before starting the next. If the agent can run unattended, it must still stop at approval gates.
7. **Keep production live.** All new work happens on a branch and in development/staging with separate configuration. Production remains on Netlify until a tested cutover is explicitly approved.
8. **Do not assume Hostinger plan compatibility.** Verify the specific plan supports required Next.js runtime behavior, server-side rendering, environment variables, deploy workflows, and operational requirements before purchase or migration. Keep deployment portable.

## Phase 0 — Discover and establish baseline (READ-ONLY)

- Confirm the project root and repository status. Locate README, package manifests and lockfiles, framework configuration, `src/` or `app/`, build scripts, Netlify configuration, Supabase client files, database migration files, tests, and deployment workflows.
- Identify the actual stack: frontend framework and version, language, bundler, routing, styling, component libraries, server functions, dependencies and build commands.
- Determine whether Supabase is used for PostgreSQL, Auth, Storage, Realtime and Edge Functions; note only what source code/config proves.
- Identify external services (email provider, WhatsApp links/API, analytics, maps, image handling, payments, captcha). Mark unknowns.
- Record current public routes and user journeys. Do not scrape private content or attempt access without authorization.
- Produce `docs/audit/00_BASELINE.md` with evidence and unresolved questions. **Stop if source code is not available** and ask the owner to open the correct project.

## Phase 1 — Full technical, UX and security audit (READ-ONLY)

### A. Product/feature inventory
Inspect and mark **IMPLEMENTED / PARTIAL / MISSING / NOT VERIFIED** for:
- Landing page; navigation; mobile responsiveness; accessibility.
- Location/city/locality discovery across India; filters (budget, room type, gender preference if applicable, furnishing, amenities); sorting and pagination.
- Listings create/edit/pause/delete, availability, image upload, moderation, duplicate detection and spam reporting.
- Sign-up, login, password reset, email verification, profiles, session management, account deletion.
- Saved listings, inquiries, owner notifications, WhatsApp deep links and email delivery.
- Admin moderation, roles, abuse reports, audit logs, analytics and support workflows.
Do not claim features exist merely because they are in this wishlist.

### B. Architecture and database
- Diagram current request flow and all deployed components.
- Map Supabase tables, relations, constraints, indexes, migrations, storage buckets and policies from repository artifacts; if dashboard-only details are unavailable, request sanitized schema/policy exports rather than guessing.
- Review RLS for every exposed table; authorization on inserts/updates/deletes; storage bucket policies; least privilege; service-role key isolation; user-owned listing access; input validation; abuse protection; transactional integrity.
- Check data consistency, backups, recovery procedure, migration history and safe schema evolution.
- Assess location queries and whether PostGIS or indexed geography would be useful based on actual data/query needs.

### C. Code and delivery quality
- Type safety, dependency health, linting, formatting, error handling, API boundaries, logging, rate limiting, idempotency for email/inquiry actions.
- Tests: unit, integration, Playwright end-to-end, accessibility, smoke tests, CI checks and release gates.
- SEO: metadata, semantic HTML, sitemap, robots, canonical URLs, structured data where relevant, indexed city/listing pages, duplicate-content risk, performance and image optimization.
- UX: search/listing conversion, mobile forms, empty/error/loading states, keyboard accessibility and touch targets.
- Deployment: Netlify settings, environment separation, DNS, SSL, caching, observability, GitHub workflow and Hostinger compatibility risks.
- Privacy and compliance readiness: consent/notice, retention, account deletion, sensitive personal information minimization and applicable Indian privacy obligations. Flag for qualified legal review; do not certify compliance.

### D. Audit outputs
Create these **report files only** (no application modifications):
1. `docs/audit/01_TECHNICAL_AUDIT.md` — executive summary, verified stack, architecture, feature matrix, findings by severity (Critical/High/Medium/Low), file/line evidence, uncertainty and remediation suggestions.
2. `docs/audit/02_SECURITY_AND_DATA.md` — RLS/auth/storage/secrets/data risks, evidence, non-destructive validation plan, backups and rollback prerequisites.
3. `docs/audit/03_UX_SEO_PERFORMANCE.md` — mobile, accessibility, SEO, speed and conversion issues; separate observed from unverified.
4. `docs/audit/04_MIGRATION_DECISION.md` — compare **retain current stack**, **incremental modernization**, and **Next.js migration**. Give reasons, effort/risk estimates as ranges, feature parity and explicit recommendation. Do not force Next.js if the current stack is already appropriate.
5. `docs/audit/05_PHASED_ROADMAP.md` — ordered milestones, dependencies, acceptance criteria, staging requirements, estimated complexity, owner decisions and launch gates.
6. `docs/audit/06_QUESTIONS_FOR_OWNER.md` — only questions that block decisions (e.g. repository access, email provider, hosting budget, expected traffic, production schema access).

**MANDATORY STOP:** Present the summary and ask: “Do you approve the proposed architecture and Phase 2 implementation plan?” Do not start Phase 2 without explicit approval.

## Target architecture — candidate, NOT a predetermined rewrite

Use the audit to decide. Preferred candidate for a public, India-wide listing marketplace:
- **Frontend/full-stack web:** Next.js (App Router) + React + TypeScript in strict mode, only if migration benefits outweigh cost and risk. Use server-rendered/indexable public listing and city pages where useful.
- **UI:** Tailwind CSS + accessible reusable components (e.g. shadcn/ui), responsive tokens, consistent form validation and states.
- **Data/backend:** Keep **Supabase PostgreSQL**, Auth, Storage and existing working Edge Functions where suitable; use RLS and safe server-side endpoints for privileged business logic. Avoid exposing service-role secrets in browsers.
- **Schema:** version-controlled SQL migrations, indexes, constraints, backups, restore drills and staging. Consider PostGIS for geographic search if justified.
- **Email:** Keep the current working provider unless there is a reason to switch; evaluate Resend or a suitable transactional provider for notifications, with SPF/DKIM/DMARC and deliverability checks.
- **WhatsApp:** Use safe click-to-chat links initially if that matches existing behavior; do not promise automated messaging without a compliant WhatsApp Business integration.
- **Observability:** Sentry or equivalent, structured logs, uptime alerts, basic product analytics with privacy controls.
- **Delivery:** GitHub, pull requests, CI, automated tests, staging and deployment rollback. Domain/hosting on Hostinger only after verifying exact Next.js support and economics; Netlify remains until cutover.
- **Security:** rate limiting, validation, upload type/size restrictions, least-privilege roles, RLS tests, secure sessions, moderation and anti-spam.

## Phase 2 — Foundation (ONLY after approval)

1. Create a dedicated feature/migration branch; confirm clean rollback path and a recoverable production backup.
2. Set up development/staging environments and separate Supabase project/config if approved. Never reuse production service-role keys in local or CI.
3. Establish architecture boundaries, strict TypeScript, lint/format, testing, environment-variable template (names only), and CI.
4. If Next.js is approved, create an incremental migration plan with route-by-route mapping, redirects, SEO preservation and shared design tokens. Prefer reusable existing components.
5. Provide a diff, tests, screenshots, and a rollback note. **Stop for approval.**

## Phase 3 — Feature parity implementation (ONLY after approval)

Implement in vertical slices, with tests and review after each slice:
1. Public landing, city/locality discovery, SEO pages, search/filter/sort/pagination.
2. Authentication/profile/account lifecycle, with existing Supabase users preserved.
3. Listings CRUD, image uploads, authorization, moderation and safe validation.
4. Saved listings, inquiries, WhatsApp links and notification emails.
5. Admin review, reporting, abuse prevention and operational dashboard.
6. Accessibility, mobile optimization, loading/empty/error states, performance budgets and analytics.
For each slice document **before/after behavior, database impact, test results, and unresolved issues**. Do not introduce payments, AI matching or unrelated features without approval.

## Phase 4 — Production readiness (ONLY after approval)

- Run lint, typecheck, unit/integration/E2E and accessibility checks; test critical journeys across desktop/mobile.
- Validate RLS policies with multiple roles and negative tests. Check secrets never reach client bundles or logs.
- Test sign-up/login/reset, create/edit listing, image upload, search, inquiry, email and WhatsApp links.
- Verify backups, restore rehearsal, observability, error reporting, abuse controls and privacy flows.
- Check performance and SEO (sitemap, redirects, canonical, indexing, metadata, page speed) against agreed thresholds.
- Produce `docs/release/RELEASE_READINESS.md` with PASS/FAIL/NOT VERIFIED, blockers and sign-off request. **Stop for approval.**

## Phase 5 — Hostinger staging and cutover (ONLY after approval)

1. Confirm exact Hostinger product and runtime compatibility with the approved app, deployment model, env vars, scaling and rollback. Compare managed hosting vs VPS operational burden; do not purchase anything automatically.
2. Deploy a staging environment without changing the public domain or production data.
3. Configure DNS and HTTPS plan; validate Supabase allowed redirect URLs, CORS/origins as applicable, email domain authentication, storage access and integrations.
4. Run staging smoke tests and verify logs, monitoring, backups and rollback.
5. Schedule a cutover, lower DNS TTL if appropriate, capture baseline metrics, deploy, update DNS **only with explicit approval**, and verify live workflows.
6. Keep Netlify deployment available as fallback during an agreed observation period. Do not cancel it automatically.
7. Produce `docs/release/CUTOVER_REPORT.md` with final settings (no secrets), tests, incidents, rollback steps and open follow-ups.

## Phase 6 — Post-launch iteration (ONLY after approval)

Monitor uptime, latency, error rates, signup-to-inquiry conversion, spam/abuse and costs. Prioritize improvements from measured user behavior. Add cities, filters, verification or mobile apps based on evidence, not assumptions.

## Agent response format after each phase

Report:
- **Phase completed** and exact files created/changed.
- **Verified facts** with file paths/line references.
- **Unknowns / access needed**.
- **Top risks** with severity and mitigations.
- **Tests run / not run** and why.
- **Next proposed phase** with estimated scope and explicit approval request.

## START NOW

**Execute Phase 0 and Phase 1 ONLY in read-only audit mode.** If the master migration prompt file is also present, treat it as additional context, but this playbook's safety and approval gates take precedence. Do not begin implementation, make production changes, or purchase hosting. Create the six audit deliverables, summarize findings, and wait for owner approval.
