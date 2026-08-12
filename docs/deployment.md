# Deployment Guide — Glow Lash Studio

How to take the four pieces of this project (website, mobile app, admin dashboard, backend) from local prototype to production. Written for whoever does the launch — no prior context assumed.

---

## 1. Website (`website/`)

The site is fully static — HTML, CSS, vanilla JS, no build step — so any static host works. Pick one of the three below; all have free tiers that comfortably cover a two-location studio.

### Option A — Netlify (recommended for this project)

1. Push the repo to GitHub/GitLab.
2. In Netlify: **Add new site → Import from Git**, select the repo.
3. Build settings: no build command; **Publish directory = `website`**.
4. Deploy. You get an `*.netlify.app` URL immediately.

Netlify also gives you Netlify Forms (see §1.4) and Netlify Identity (see §3), which is why it's the default recommendation here — one vendor covers site, forms, and admin gating.

### Option B — Vercel

1. **Add New Project → Import** the repo.
2. Framework preset: **Other**. Root directory: `website`. No build command, output directory `.`.
3. Deploy.

Vercel is equally good for the static site but has no built-in form handling — you'd pair it with Formspree.

### Option C — Cloudflare Pages

1. **Workers & Pages → Create → Pages → Connect to Git**.
2. Build command: none. Build output directory: `website`.
3. Deploy.

Cloudflare is the strongest choice if you also plan to use **Cloudflare Access** to gate the admin dashboard (§3) and want everything on one DNS/CDN provider.

### 1.1 Custom domain + HTTPS

1. Buy/hold `glowlashstudio.com` at any registrar.
2. In your host's dashboard, add the custom domain (`glowlashstudio.com` and `www.glowlashstudio.com`).
3. Point DNS: either move nameservers to the host (simplest, especially on Cloudflare) or add the A/CNAME records the host shows you.
4. HTTPS is automatic on all three hosts (Let's Encrypt / managed certs). Verify the cert issued, then enable **"force HTTPS"** so `http://` 301-redirects.
5. Pick one canonical host — we recommend apex `glowlashstudio.com` — and 301 the `www` variant to it. This matters for SEO consistency (see `docs/seo-implementation.md`).

### 1.2 Images and CDN

All three hosts serve assets from a global CDN by default, so you don't need a separate image CDN at this size. If image weight becomes a problem later (galleries grow), put images behind an image-resizing service — Cloudflare Images, imgix, or Cloudinary — and request width-appropriate variants (`?w=800&fm=webp`). Keep the existing `width`/`height` attributes on `<img>` tags either way; they prevent layout shift regardless of where images are served from.

### 1.3 Replace the Unsplash placeholders

The site currently hot-links Unsplash photos as art direction placeholders. **Before launch, replace every one with the studio's own photography.** Reasons: Unsplash URLs can change or be removed, hot-linking adds a third-party dependency to your Largest Contentful Paint, and real photos of the actual studios and lash work convert far better and are required for honest local SEO.

Process: shoot or license final images → export as WebP or AVIF at the actual display sizes (roughly 1600px wide for heroes, 800px for cards) → place in `website/assets/img/` → update the `src`/`srcset` in each page → keep descriptive `alt` text.

### 1.4 Form backend (contact / booking-request forms)

The HTML forms need a backend to receive submissions. Two low-effort options:

- **Netlify Forms** (if hosting on Netlify): add `data-netlify="true"` and a `name` attribute to each `<form>`, plus a hidden `form-name` input. Submissions appear in the Netlify dashboard; add email notifications there. Add the hidden honeypot field (`netlify-honeypot`) for spam. Free tier: 100 submissions/month, plenty for a contact form.
- **Formspree** (host-agnostic): create a form at formspree.io, set the form `action` to your endpoint (`https://formspree.io/f/XXXX`), method POST. Works identically on Vercel/Cloudflare.

Either way, forms should be for **inquiries and gift-card questions only** — actual booking should go through a booking engine:

### 1.5 Booking engine embed — options and tradeoffs

Until the custom backend (§4) exists, embed a hosted booking engine behind every "Book" CTA. Three candidates commonly used by lash studios:

| | Square Appointments | GlossGenius | Boulevard |
|---|---|---|---|
| **Pricing shape** | Free for 1 location/1 staff; paid tiers per location | Flat monthly per plan (~$24–$48) | Premium — custom pricing, aimed at larger salons |
| **Payments** | Square only (2.5–2.6% + 10¢ in person) | Built-in flat-rate processing (2.6%) | Integrated, negotiable at volume |
| **Embed options** | Hosted booking page + embeddable widget/link | Hosted booking site + link-in-bio style; limited true embed | Fully brandable, self-booking overlay widget on your own site |
| **Multi-location** | Yes, on paid tiers | Yes, on higher tiers | Yes — built for it |
| **Memberships/packages** | Basic (via Square ecosystem) | Yes | Strong (memberships, packages, deposits) |
| **Fit** | Cheapest path live this week | Beauty-industry UX, easiest for solo→small teams | Best brand match for "quiet luxury" but highest cost |

Recommendation: start on **Square Appointments** (fast, cheap, two-location support, deposits and no-show protection), and reassess once membership volume justifies **Boulevard**, whose overlay widget keeps the client on glowlashstudio.com — the closest experience to the eventual custom backend. Whatever you choose, keep the CTA buttons pointing at one shared URL/config value so swapping engines is a one-line change.

---

## 2. Mobile app (`app/`) — Expo

The app is an Expo (React Native) project. Ship it with **EAS (Expo Application Services)**.

### 2.1 Prerequisites

- Expo account (expo.dev) and `npm i -g eas-cli`, then `eas login`.
- Apple Developer Program membership ($99/yr) for iOS.
- Google Play Console account ($25 one-time) for Android.

### 2.2 Configure

```bash
cd app
eas init            # links the project to your Expo account
eas build:configure # creates eas.json with build profiles
```

In `app.json` / `app.config.js`, set the identifiers before the first build — they can't change later:

- `ios.bundleIdentifier`: `com.glowlashstudio.app`
- `android.package`: `com.glowlashstudio.app`
- version + `buildNumber`/`versionCode` bumping per release (or use EAS auto-increment).

### 2.3 Environment config

Don't hardcode API URLs or keys. Use EAS environment variables per profile (`development`, `preview`, `production`):

```bash
eas env:create --name EXPO_PUBLIC_API_URL --value https://api.glowlashstudio.com --environment production
eas env:create --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value pk_live_... --environment production
```

`EXPO_PUBLIC_*` variables are readable in app code. Secrets that must never ship in the binary (none currently — Stripe publishable keys are fine to ship) stay server-side.

### 2.4 Build + internal testing

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

- **iOS → TestFlight:** `eas submit --platform ios` uploads the build to App Store Connect. Add internal testers (up to 100, instant) under TestFlight; external testers require a brief beta review.
- **Android → Play internal testing:** `eas submit --platform android`, then in Play Console promote the build to the **Internal testing** track and add tester emails. Internal testing is instant; production requires review.

### 2.5 Push notification credentials

Push (appointment reminders, fill-window nudges) requires platform credentials:

- **iOS (APNs):** create an **APNs Auth Key** (.p8) in the Apple Developer portal (Keys → +, enable Apple Push Notifications service). Upload it via `eas credentials` (recommended: let EAS manage it). One key covers all your apps; note the Key ID and Team ID.
- **Android (FCM):** create a Firebase project, add the Android app with package `com.glowlashstudio.app`, and upload the **FCM service account key** (JSON) via `eas credentials`. Modern FCM uses the HTTP v1 API with service-account auth — don't use the legacy server key.
- If using **Expo Push Service** (simplest), the server sends to Expo's API with the user's Expo push token, and Expo handles APNs/FCM using the credentials above. The backend stores device tokens via `POST /v1/notifications/devices` (see `docs/api-spec.md`).

Test push on a **physical device** — simulators don't receive APNs.

---

## 3. Admin dashboard (`admin/`)

The dashboard is a static SPA with a **mock** login — the credential check happens in client-side JS, which protects nothing. Do not put it on the open internet as-is. Two acceptable patterns:

### Option A — Static hosting behind an auth wall (fastest)

Deploy `admin/` as a separate site (subdomain `admin.glowlashstudio.com`) and gate it at the platform level:

- **Cloudflare Access** (part of Zero Trust, free up to 50 users): put the admin subdomain behind an Access policy — allow only specific emails or your Google Workspace domain. Users authenticate with a one-time PIN or SSO before any HTML is served. This is the strongest of the easy options because unauthenticated requests never reach the app.
- **Netlify Identity + role-based redirects**: enable Identity on the admin site, set registration to invite-only, and use a `_redirects` rule with role gating (`/* 200! Role=admin`). Works, but Netlify Identity is in maintenance mode — fine for a prototype gate, not a long-term bet.

Either way, keep `noindex` on the admin (already set via meta tag) and don't link to it from the public site.

### Option B — Deploy with the backend (production target)

Once the API exists (§4), serve the admin from the backend (or keep it static but make the login real): the login form calls `POST /v1/auth/login`, stores the JWT, and every data read/write goes through `/v1/admin/*` endpoints with role checks server-side. All the mutation points in `admin/admin.js` are already annotated with `// connect to API:` comments mapping to `docs/api-spec.md` — the migration is mechanical: replace each in-memory mutation with a `fetch` and re-render from the response.

Even with real auth, keep platform-level gating (Option A) as a second layer for an internal tool. It's cheap defense in depth.

---

## 4. Backend — recommended stack and migration path

### Recommended stack

**Fastest to production: Supabase** (managed Postgres + auth + row-level security + storage + realtime):

- Postgres schema for customers, appointments, services, staff, memberships, loyalty ledger, coupons, forms, submissions.
- Supabase Auth for client accounts (email + Apple/Google sign-in for the app) — issues JWTs the API and RLS policies verify.
- Row Level Security so clients can only read their own rows; an `admin` role claim unlocks the admin endpoints.
- Edge Functions (or a thin Node service) for logic that shouldn't live in the client: Stripe payment intents, Twilio sends, waitlist offers, automation scheduling.

**Alternative: Node/Express (or Fastify) + Postgres** on Render/Railway/Fly.io. More control, more ops. Choose this if you expect heavy custom logic (complex availability rules, custom membership proration) or want to avoid vendor coupling. Same schema, same API surface — `docs/api-spec.md` is written to be implementation-agnostic.

Either way, add: **Stripe** (payments, memberships via Stripe Billing, gift cards), **Twilio** (SMS reminders + waitlist offers), **Resend/Postmark** (transactional email), and a job scheduler (Supabase cron / pg_cron / BullMQ) for the automation triggers (fill reminder at day 14, win-back at day 45, birthday sends).

### Migration path from mocks

1. **Stand up the schema.** The shapes in `admin/admin.js` (`DATA.customers`, `DATA.appointments`, `DATA.coupons`, …) are the draft schema — translate them to tables nearly 1:1, adding `created_at/updated_at` and foreign keys.
2. **Implement read endpoints first** (`GET /v1/admin/customers`, `GET /v1/admin/appointments`). Point the dashboard's render functions at them; the UI needs no structural change.
3. **Implement mutations** following the `// connect to API:` comments — each names its exact endpoint and payload.
4. **Real auth**: swap the mock login for `POST /v1/auth/login`; store the access token in memory, the refresh token in an httpOnly cookie.
5. **Website + app**: point the booking flow at `/v1/availability` and `/v1/appointments`, replacing the third-party booking embed when you're confident in the engine.
6. **Cut over notifications**: automations move from "toggle in a mock list" to scheduled jobs reading the same `automations` table the dashboard edits.

Sequence it so the booking engine embed (§1.5) keeps taking real bookings the whole time — the custom backend replaces it last, not first.
