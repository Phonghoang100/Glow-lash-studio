# Glow Lash Studio — Digital Suite

Complete digital presence for a two-location luxury lash studio in Lawrenceville and Duluth, GA: marketing website, client mobile app, staff admin dashboard, and the documentation to take all three to production.

*Wake up beautiful.*

## What's in this repo

```
glow-lash-studio/
├── website/       Static marketing + SEO site (HTML/CSS/vanilla JS, no build step)
│   ├── index, about, services, pricing, gallery, reviews, membership,
│   │   booking, gift-cards, faq, contact, service-areas, policies…
│   ├── blog/      Journal posts (Article schema, founder byline)
│   ├── css/ js/ assets/   Shared design system, logo SVGs
│   └── _template.html     Canonical head/header/footer every page uses
├── app/           Client mobile app — Expo (React Native, TypeScript, expo-router)
│   ├── app/       Routes: (auth), (tabs), appointment/, service/
│   └── src/       api/, auth/, components/, data/ (mocks), theme/, notifications
├── admin/         Staff dashboard — self-contained SPA (vanilla JS + Chart.js CDN)
│   └── index.html + admin.css + admin.js   (mock login: admin@glowlashstudio.com / any password)
└── docs/
    ├── brand-identity.md      Canonical brand facts, palette, services & prices — the source of truth
    ├── deployment.md          Hosting, domains, EAS builds, push credentials, backend migration
    ├── api-spec.md            REST spec the mocks are written against (JWT, Stripe, Twilio webhooks)
    └── seo-implementation.md  What's built into the site + local SEO launch checklist
```

`docs/brand-identity.md` is canonical: names, addresses, phone numbers, hours, prices, and hex values used anywhere else must match it exactly.

## Quick starts

### Website

No build step. Open `website/index.html` in a browser, or serve it locally so relative paths behave like production:

```bash
cd website && python3 -m http.server 8080
# → http://localhost:8080
```

Deploy: any static host, publish directory `website/`. Full steps in `docs/deployment.md` §1.

### Admin dashboard

```bash
cd admin && python3 -m http.server 8081
# → http://localhost:8081
```

Sign in with **admin@glowlashstudio.com** and any password (mock auth). Seven views: Overview (KPIs + charts), Appointments (filters, detail drawer, waitlist), Customers (search, profiles, intake status), Staff (schedules, time off, utilization), Analytics (cohorts, MRR, heatmap), Marketing (coupons CRUD, automations), Forms (intake builder preview + submissions). All actions mutate in-memory state; every mutation is annotated with a `// connect to API:` comment mapping to `docs/api-spec.md`. Chart.js loads from cdnjs, so charts need a network connection.

### Mobile app

```bash
cd app
npm install
npx expo start        # scan the QR with Expo Go, or press i / a for a simulator
```

Data comes from the mock layer in `src/data/`; point `src/api/` at a real backend when one exists. Store builds and push credentials: `docs/deployment.md` §2.

## Mocked vs. production — honest status

| Capability | Status today | What production requires |
|---|---|---|
| **Auth** | Mock. Admin login is a client-side email check; app auth is local state in `src/auth/` | Real `POST /auth/*` with JWT + refresh rotation (`docs/api-spec.md`); gate the admin behind Cloudflare Access or the backend |
| **Booking engine** | Mock availability/appointments in admin + app; website "Book" CTAs are placeholders | Interim: embed Square Appointments / GlossGenius / Boulevard (tradeoffs in `docs/deployment.md` §1.5). Long-term: `/availability` + `/appointments` endpoints |
| **Payments** | Not wired. Prices displayed only; no charges anywhere | Stripe PaymentIntents + Billing for memberships, server-derived amounts, webhook-driven state |
| **Push notifications** | App requests permission and registers a token locally (`src/notifications.ts`); nothing is sent | APNs key + FCM service account via EAS, Expo Push (or direct), server-side device-token storage |
| **Forms (intake/consent)** | Static preview in admin; website contact form has no backend | Netlify Forms/Formspree for contact; real form-template + submission endpoints with encrypted storage for health data |
| **SMS/email automations** | Toggles + editable templates in admin, in-memory only | Twilio + Resend/Postmark, scheduler (cron/BullMQ) reading the automations table, STOP handling |
| **Data (customers, appts, analytics)** | Hand-crafted mock objects in `admin/admin.js` and `app/src/data/` | Postgres schema (mirror the mock shapes), read endpoints first, then mutations |
| **Reviews / loyalty / gift cards / referrals** | Displayed with mock values | Endpoints specced in `docs/api-spec.md`; loyalty math (1 pt/$1, 250 pts = $25) and referral credits move server-side |
| **Images** | Unsplash placeholders, hot-linked | Studio photography, locally hosted WebP/AVIF — required before launch |
| **SEO on-page** | **Real** — semantic HTML, per-page JSON-LD, sitemap, robots, canonicals, OG | Only the operational half remains: GBP, citations, reviews (`docs/seo-implementation.md` Part 2) |

## Recommended next steps, in order

1. **Ship the website** — static hosting + `glowlashstudio.com` + HTTPS (`deployment.md` §1). Swap Unsplash placeholders for real photography before announcing.
2. **Take real bookings** — embed Square Appointments (fastest credible option) behind the existing Book CTAs.
3. **Run the local SEO launch checklist** — two Google Business Profiles, Search Console, Apple Maps/Yelp/Nextdoor, review automation (`seo-implementation.md` Part 2).
4. **Stand up the backend** — Supabase (Postgres + auth + RLS), read endpoints first, following the migration path in `deployment.md` §4.
5. **Make the admin real** — deploy behind Cloudflare Access, replace mock login and the `// connect to API:` points with real calls.
6. **Ship the app** — EAS builds to TestFlight/Play internal testing once the API serves real availability, then wire payments and push.
