# Flatemate — Phase 0: Baseline & Discovery Audit

**Audit Date:** 2026-10-31  
**Project Directory:** `B:\Flatemate`  
**Git Remote:** `https://github.com/karan11233/Flatemate.git` (`main` branch)  
**Live Public Deployment:** `https://flatemate-ahmedabad.netlify.app/`  

---

## 1. Repository Topology & Dual Architecture

The repository contains two distinct applications residing in the same project root:

1. **React Native / Expo Mobile Application (`/` root & `/src`)**:
   - Framework: React Native `0.88.0` with Expo SDK `58.0.0`
   - Language & Runtime: TypeScript `~6.0.3`, Node.js `>= 22.11.0`
   - Navigation: `@react-navigation/native` `^7.2.4`, `@react-navigation/bottom-tabs` `^7.16.1`, `@react-navigation/native-stack` `^7.15.1`
   - Data & Auth: Firebase SDK `^12.14.0` (initialized in `src/utils/firebase.ts`)
   - Assets & Design: Custom Gotham fonts (`src/Assets/Fonts/`), vector icons (`@expo/vector-icons`), custom SVG assets (`src/Assets/Svg/`)

2. **Vite / React Web Application (`/web`)**:
   - Framework: React `^18.3.1`, React DOM `^18.3.1`
   - Bundler & Tooling: Vite `^6.1.0`, `@vitejs/plugin-react` `^4.3.4`, TypeScript `^5.7.3`
   - Styling: Tailwind CSS `^3.4.17`, PostCSS `^8.4.49`, Autoprefixer `^10.4.20`
   - Icons: Lucide React `^0.475.0`, Iconify CDN
   - Database / Auth Client: `@supabase/supabase-js` `^2.118.0`
   - Deployment: Netlify SPA configuration (`netlify.toml` in both root and `/web`)

---

## 2. File & Configuration Inventory

| Category | Path | Purpose / Evidence |
|---|---|---|
| **Root Package Manifest** | `package.json` | React Native / Expo scripts, dependencies, engine requirement |
| **Root Entry** | `App.tsx` | Expo font loader (`Gotham-Bold`, `Medium`, `Book`), `AuthProvider`, `ChatProvider`, `AppNavigator` |
| **Web Package Manifest** | `web/package.json` | Vite build commands (`dev`, `build`, `preview`), React 18, Supabase client |
| **Web Entry** | `web/src/main.tsx` | StrictMode bootstrap mounting `App` into `#root` |
| **Web Core Component** | `web/src/App.tsx` | Monolithic application component (2,694 lines) managing state, feed, and forms |
| **Web Deployment Config** | `netlify.toml` / `web/netlify.toml` | Build directory `dist`, build command `npm run build`, SPA fallback rewrite `/* -> /index.html` (status 200) |
| **Database Schema** | `web/supabase_schema.sql` | SQL schema script defining `spaces` and `inquiries` tables and RLS policies |
| **Supabase Client Layer** | `web/src/lib/supabase.ts` | Supabase client initialization, auth helpers, and CRUD queries |
| **Content Moderation** | `web/src/lib/moderation.ts` | Client-side keyword blocklist, Indian mobile regex validation, cooldown rate limiting |
| **Unlinked Modular Components** | `web/src/components/FlatCard.tsx`, `HeroSection.tsx`, etc. | Modular components created during early refactor but currently unmounted |

---

## 3. External Services Identified

1. **Supabase Cloud**:
   - Used for PostgreSQL database (`spaces`, `inquiries`) and authentication.
   - Project URL and anon key referenced in `web/src/lib/supabase.ts:5-6`.
2. **Netlify**:
   - Production hosting provider serving `https://flatemate-ahmedabad.netlify.app/`.
   - Continuous deployment linked to the git repository.
3. **Google Analytics (GA4)**:
   - Measurement ID `G-X9KYFTF13N` embedded in `web/index.html:5-11`.
4. **Google Search Console**:
   - Verification token `LWkocruf0ZcXxoCZKLonhhXLH0WuKFJOGQ_1Vk44ZYo` in `web/index.html:31`.
5. **WhatsApp (Direct Deep Links)**:
   - Client-side `wa.me/91...` deep links embedded in `web/src/App.tsx:1203` and `web/src/App.tsx:2602`. No WhatsApp Business Cloud API is currently used.
6. **Firebase**:
   - Used exclusively in the React Native mobile application (`src/utils/firebase.ts`), separate from the web app's Supabase backend.

---

## 4. Current Public Routes and User Journeys

In the production web application (`web/`):
- **Single Page Application (SPA)**: The entire web app operates on a single route (`/`) with hash and modal overlays.
- **Seeker Journey**:
  1. Lands on home hero.
  2. Filters by locality (Ahmedabad neighborhoods: Satellite, Vastrapur, Prahlad Nagar, Bopal, etc.), budget, and category tab (All / Fresh Flats / Room Replacements / Roommate Seekers).
  3. Clicks "Interested" to open `ExpressInterestModal` or clicks "WhatsApp" to open a pre-filled direct WhatsApp chat with the host.
  4. Inquiries submit to Supabase `inquiries` table.
- **Host / Lister Journey**:
  1. Clicks "List Your Space" to open embedded form.
  2. Selects category (`fresh`, `replacement`, `seeker`), fills details, selects amenities, uploads photos.
  3. Optionally signs up / logs in via `AuthModal` (or relies on device-generated ID).
  4. Submits listing to Supabase `spaces` table.
  5. Reviews leads and updates listing status via `MyListingsModal`.

---

## 5. Unresolved Questions & Not Verified Items

1. **Production Supabase Dashboard Access**: Exact Supabase Auth settings (e.g. SMTP server configuration, email confirmation toggles, actual RLS status in production DB) cannot be verified from code alone.
2. **Netlify Environment Variables**: Whether `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured in Netlify build environment variables or if production relies solely on the fallback strings in `web/src/lib/supabase.ts:5-6`.
3. **Domain & DNS Control**: Current DNS registrar and management credentials for `flatemate.in` or planned custom domains.
4. **Production Database Volume**: Total rows currently in `spaces` and `inquiries`, and whether actual base64 photos exist in production database rows.
