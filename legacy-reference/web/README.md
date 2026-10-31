# Flatemate Web Application

A modern, high-speed, zero-brokerage web application for discovering verified flats and compatible flatmates across India (Bengaluru, Mumbai, Delhi NCR, Pune, Hyderabad).

## Key Features

1. **Dual Discovery Mode**:
   - **Flats & Rooms**: Search full flats (1 BHK, 2 BHK, 3 BHK), private rooms in shared flats, and studios with 0% brokerage.
   - **Flatmates**: Discover compatible roommates filtered by lifestyle habits (cleanliness 1-5, early bird vs. night owl, diet, smoking, drinking, and pet friendliness).

2. **Trust & Anti-Ghosting Guarantees**:
   - **Verified Shield**: 2-step verification badge for phone OTP and Government ID checks.
   - **Active Status Dot**: Real-time pulse indicator showing currently active users.
   - **Response Speed Metric**: Live metrics on profiles (e.g. `⚡ Typically replies in 15 mins`, 98% response rate).

3. **Instant Zero-Brokerage Actions**:
   - **Schedule a Visit**: Interactive booking modal for both in-person walkthroughs and live video calls.
   - **Direct Inquiry Chat**: Web messaging modal with pre-configured icebreaker questions.
   - **Post Space / Room**: 3-step listing creation flow with immediate publishing.
   - **Saved / Favorites**: Slide-out drawer to bookmark and compare flats and roommates.

## Getting Started

### Local Development
From the repository root:
```bash
npm run web:dev
```
Or directly inside the `web` folder:
```bash
cd web
npm run dev
```

### Production Build
```bash
npm run web:build
```
The optimized production bundle will be generated in `web/dist/`.

## 100% Free Zero-Cost Hosting Deployment

Because this is a pure client-side Vite application, you can host it for **₹0 / month** on:
- **Vercel**: Import Git repository, set root directory to `web`, framework to `Vite`, deploy in 1 click.
- **Cloudflare Pages**: Link repo, build command `npm run build`, output directory `dist`.
- **Netlify**: Build command `npm run build`, publish directory `dist`.
