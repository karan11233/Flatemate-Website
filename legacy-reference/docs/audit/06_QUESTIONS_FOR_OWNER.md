# Flatemate — Phase 1: Questions for Project Owner

**Audit Date:** 2026-10-31  
**Purpose:** Resolve critical decision blockers prior to initiating Phase 2 implementation

---

The following questions directly affect architectural and deployment decisions for Flatemate:

### 1. Supabase Project & Dashboard Access
- **Question**: Do you have administrative access to the live Supabase dashboard (`https://supabase.com/dashboard/project/upckzykqjnugdyvlynvq`)?
- **Why this matters**: Updating RLS policies, creating the `listing-photos` storage bucket, and configuring production backup exports require dashboard or direct SQL execution access.
- **Action Needed**: Confirm whether we should provide SQL scripts for you to run in the Supabase SQL editor, or if a staging Supabase project should be created for initial testing.

---

### 2. Custom Domain & Hostinger Plans
- **Question**: Have you already purchased a domain or hosting plan on Hostinger? If so, what exact plan type was purchased (e.g. *Single/Premium Web Hosting* vs *Hostinger Cloud* vs *Hostinger KVM VPS*)?
- **Why this matters**: Standard Hostinger shared web hosting does not support Node.js Server-Side Rendering (Next.js). If you only purchased a domain on Hostinger, the best architecture is to point the Hostinger DNS to Netlify/Vercel (keeping hosting free, zero-maintenance, and production-grade).
- **Action Needed**: Share your domain name and Hostinger plan type.

---

### 3. Production Data Volume
- **Question**: Approximately how many active listings and inquiries currently exist in the live production database? Are there any live users or active listings that must be preserved with 100% uptime right now?
- **Why this matters**: Determines whether data migration scripts must transform existing Base64 records into storage files, and dictates the strictness of the zero-downtime maintenance window.

---

### 4. Authentication Strategy & SMS OTP
- **Question**: For user logins, do you want to continue with the current frictionless flow (where mobile numbers sign up with a password), or do you plan to introduce real SMS OTP verification (e.g. via Twilio or MSG91)?
- **Why this matters**: Real SMS OTP incurs transactional SMS costs per login in India, whereas email/password or password-based mobile auth remains zero-cost.

---

### 5. Architectural Approval for Phase 2
- **Question**: Do you approve the proposed hybrid roadmap:
  - **Immediate**: Patch critical RLS vulnerabilities and implement Supabase Storage on the existing deployment.
  - **Next**: Build the Next.js (App Router) multi-city frontend on an isolated feature branch with Server-Side Rendering and dynamic WhatsApp sharing?
- **Action Needed**: Please reply with your approval or specific modifications to proceed.
