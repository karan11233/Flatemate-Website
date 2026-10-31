# Flatemate — Phase 1: Migration Decision & Architecture Evaluation

**Audit Date:** 2026-10-31  
**Subject:** Comparative evaluation of architectural paths for Flatemate's pan-India expansion

---

## 1. Options Comparison

We evaluate three distinct architectural paths:

### Option A: Retain Current Stack (Vite + React 18 SPA on Netlify)
*Maintain the existing Vite SPA, fix critical security vulnerabilities in-place, and retain current build/deploy pipelines.*

- **Pros**:
  - Lowest short-term engineering risk; zero disruption to current deployment pipelines.
  - Very fast development iteration with Vite HMR.
  - Generous free tier on Netlify for static asset delivery.
- **Cons**:
  - **Fatal SEO Barrier for Marketplace**: Marketplace businesses depend heavily on organic search (e.g. "2BHK flat in HSR layout Bangalore", "roommate in Koramangala"). Client-side rendering cannot provide fast, crawlable, pre-rendered listing pages with dynamic OpenGraph meta tags.
  - Single-bundle bloat continues to grow as new cities and features are added.
- **Estimated Effort**: 3–5 working days.
- **Risk Level**: Low technical execution risk, but **High Business Risk** due to poor search visibility.

---

### Option B: Incremental Modernization (Modular Vite SPA + React Router + Supabase RLS Fixes)
*Decompose the monolithic `App.tsx`, introduce React Router for deep linking (`/cities/:city`, `/listing/:id`), fix RLS and storage, while keeping Vite SPA.*

- **Pros**:
  - Modularizes code and separates concerns cleanly.
  - URL routing enables bookmarking, filter sharing, and deep links.
  - Keeps hosting purely static on Netlify.
- **Cons**:
  - Still relies on Client-Side Rendering (CSR). Dynamic meta tags for WhatsApp/Twitter social sharing per listing remain problematic without edge prerendering workers.
  - Sub-optimal indexing for long-tail search queries across thousands of nationwide listings.
- **Estimated Effort**: 6–10 working days.
- **Risk Level**: Medium execution risk; moderate business risk for SEO.

---

### Option C: Next.js Modernization (Next.js App Router + React + Tailwind + Supabase)
*Migrate the web front-end to Next.js (App Router), leveraging Server Components, dynamic Server-Side Rendering (SSR) for listing pages, and Static Site Generation (SSG) for city/locality landing hubs.*

- **Pros**:
  - **Search & Social Superiority**: Search engines receive fully rendered HTML for every listing and city page. Dynamic OpenGraph tags generate rich previews when users share flat listings on WhatsApp or Telegram.
  - **Server-Side Security**: Database queries for public listings can run securely on the server with caching; private inquiries and mutations are protected behind server actions / API endpoints without exposing raw database queries to the browser.
  - **Shared Component Ecosystem**: Leverages the existing Tailwind CSS tokens and modern UI component patterns (shadcn/ui style).
- **Cons**:
  - Requires a Node.js server runtime or edge runtime (Netlify Next.js Runtime, Vercel, or a compatible Node/VPS plan on Hostinger).
  - Slightly higher initial migration effort.
- **Estimated Effort**: 10–15 working days (phased rollout).
- **Risk Level**: Medium technical risk; **Lowest Strategic / Business Risk** for nationwide marketplace growth.

---

## 2. Summary Comparison Matrix

| Evaluation Dimension | Option A: Retain Current Stack | Option B: Incremental Modernization | Option C: Next.js Modernization |
|---|---|---|---|
| **Effort Estimate** | 3–5 days | 6–10 days | 10–15 days |
| **SEO for Pan-India Listings** | Poor (CSR only) | Fair (Prerender hacks needed) | **Excellent** (Native SSR/SSG) |
| **WhatsApp Preview Cards** | Static / Generic only | Static / Generic only | **Dynamic per listing** |
| **Code Modularity** | Poor (Monolithic `App.tsx`) | Good (Modular routes) | **Excellent** (Route-based) |
| **Security Posture** | Fixed RLS, client queries | Fixed RLS, client queries | **Hardened Server Actions** |
| **Hostinger Compatibility** | 100% (Static web) | 100% (Static web) | **Conditional** (Requires Node/VPS) |
| **Rollback Simplicity** | Instant | Instant | Instant via Git branch |

---

## 3. Hostinger Compatibility & Hosting Evaluation

The project brief notes that the owner is considering **Hostinger** for domain and hosting. We highlight critical infrastructure requirements:

1. **Hostinger Shared Web Hosting Plans**:
   - Standard Hostinger shared hosting (cPanel/hPanel) is optimized for PHP/WordPress and static HTML/CSS/JS.
   - **Warning**: Shared hosting **does not** support long-running Node.js processes, Next.js server-side rendering, or automatic Next.js edge builds.
   - If Option A or B (static Vite SPA) is chosen, Hostinger Shared Hosting will work cleanly by uploading the `dist/` directory.
   - If Option C (Next.js) is chosen, Hostinger **requires a Hostinger VPS plan** (running Docker / Node.js) or hosting the front-end on a managed serverless platform (such as Netlify Next.js runtime or Vercel) while pointing the Hostinger domain DNS to it.

2. **Recommended Hosting Strategy**:
   - **Domain**: Register domain on Hostinger.
   - **Hosting**: Keep the web application on **Netlify** (or Vercel) using their automated GitHub CI/CD, preview deploys, and native Next.js/SSR runtime adapters.
   - **DNS**: Simply point Hostinger domain A / CNAME records to Netlify. This eliminates all server maintenance overhead while keeping deployment costs zero or minimal.

---

## 4. Explicit Recommendation

### **Recommended Path: Hybrid Phased Modernization toward Option C**

To balance immediate safety with long-term marketplace competitiveness, we recommend a **two-stage modernization**:

1. **Stage 1 (Immediate - Current Stack)**:
   - Patch critical security vulnerabilities (RLS policies, inquiries exposure) in the live Supabase project.
   - Implement Supabase Storage for property images.
   - Keep Netlify live without downtime.

2. **Stage 2 (Pan-India Foundation - Option C Next.js)**:
   - Implement Next.js App Router on a dedicated development branch (`feature/nextjs-modernization`).
   - Deliver dynamic city landing pages (`/ahmedabad`, `/bengaluru`, `/pune`, `/mumbai`, `/delhi-ncr`).
   - Deliver server-rendered listing pages (`/flat/:slug`) with automated WhatsApp social preview tags and rich JSON-LD snippets.
   - Retain Netlify staging preview until the owner approves a seamless domain cutover.
