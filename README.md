# Flatemate Website (Pan-India)

Independent, modern, responsive, and SEO-friendly web platform for **Flatemate**, connecting flatmates and flat owners across India with zero brokerage.

---

## Directory Structure

```
Flatemate-Website/
├── legacy-reference/   # Read-only snapshot of legacy Vite client & audit documents
├── docs/               # Architecture, design specifications, and migration roadmap
└── website/            # Production Next.js 15+ (App Router) website codebase
```

## Security & Operational Principles
- **No Shared Secrets**: All sensitive environment variables are configured via `.env.local` using the template from `.env.example`.
- **Complete Decoupling**: Fully isolated from the React Native mobile application repository (`B:\Flatemate`).
- **Dedicated Database**: Connects to a dedicated Supabase project with hardened Row-Level Security policies.
