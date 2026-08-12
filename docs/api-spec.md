# API Specification — Glow Lash Studio

REST API for the website booking flow, the mobile app, and the admin dashboard. Implementation-agnostic (works for Supabase Edge Functions or a Node/Postgres service — see `docs/deployment.md` §4). Every mutation point in `admin/admin.js` carries a `// connect to API:` comment naming its endpoint here.

- **Base URL:** `https://api.glowlashstudio.com/v1`
- **Format:** JSON request/response, UTF-8. Timestamps ISO 8601 with timezone (`America/New_York` business logic, UTC storage).
- **IDs:** opaque strings (UUIDs).
- **Money:** integer cents (`18500` = $185.00) to avoid float drift.

---

## Auth model (JWT)

- `POST /auth/login` returns a short-lived **access token** (JWT, 15 min) and a **refresh token** (30 days, rotated on every use).
- Access token goes in `Authorization: Bearer <token>` on every authenticated call.
- JWT claims: `sub` (user id), `role` (`client` | `staff` | `admin`), `locs` (staff: permitted location ids), `exp`, `iat`.
- Clients (app/web users) get `role: client` and can only touch their own resources — enforce server-side, never by obscurity.
- Admin dashboard requires `role: admin` on all `/admin/*` routes; `staff` may read their own schedule and appointments.
- Web: refresh token in an `httpOnly; Secure; SameSite=Strict` cookie. App: refresh token in SecureStore/Keychain.
- Rate-limit `/auth/*` (e.g. 10/min/IP) and return `401` on expired access tokens so clients know to refresh.

**Error envelope** (all non-2xx):

```json
{ "error": { "code": "slot_unavailable", "message": "That time was just booked. Here are the nearest alternatives.", "details": {} } }
```

---

## Endpoint index

### Auth
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | — | Create client account |
| POST | `/auth/login` | — | Email + password → tokens |
| POST | `/auth/refresh` | refresh token | Rotate tokens |
| POST | `/auth/logout` | Bearer | Revoke refresh token |
| POST | `/auth/password/reset-request` | — | Send reset email |

### Catalog & availability
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/locations` | — | Both studios: address, hours, phone |
| GET | `/services` | — | Service list with prices/durations |
| GET | `/staff` | — | Public artist profiles |
| GET | `/availability` | — | Open slots for service × artist × location × date range |

### Appointments
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/appointments` | client | My upcoming + past appointments |
| POST | `/appointments` | client | Book a slot |
| POST | `/appointments/:id/reschedule` | client/admin | Move to a new slot |
| POST | `/appointments/:id/cancel` | client/admin | Cancel (policy enforced) |

### Payments, gift cards, loyalty
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/payments/intents` | client | Create Stripe PaymentIntent (deposit or full) |
| GET | `/payments/methods` | client | Saved cards (Stripe customer) |
| POST | `/gift-cards` | client | Purchase gift card |
| GET | `/gift-cards/:code` | — | Check balance |
| POST | `/gift-cards/:code/redeem` | client/admin | Apply to a sale |
| GET | `/loyalty` | client | Points balance + ledger |
| POST | `/loyalty/redeem` | client | 250 pts → $25 credit |
| GET | `/referrals` | client | My referral code + status |
| POST | `/referrals/claim` | client | New client claims a code (give $25 / get $25) |

### Messaging, reviews, notifications
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/messages` | client | Thread with the studio |
| POST | `/messages` | client | Send message |
| GET | `/reviews` | — | Published reviews |
| POST | `/reviews` | client | Submit review (post-appointment only) |
| POST | `/notifications/devices` | client | Register device push token |
| DELETE | `/notifications/devices/:id` | client | Unregister on logout |
| GET/PUT | `/notifications/preferences` | client | Reminder/marketing opt-ins |

### Admin
| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/dashboard` | KPI aggregates (overview view) |
| GET | `/admin/appointments` | Filterable list (date, loc, artist, status) |
| PATCH | `/admin/appointments/:id` | Status changes (confirm, no-show), notes |
| GET/POST | `/admin/customers` · `POST` creates walk-in | Customer table + profiles |
| GET/PATCH | `/admin/customers/:id` | Profile, notes, flags |
| GET | `/admin/staff` · `/admin/staff/:id/schedule` | Artists, weekly grids, utilization |
| GET/POST/PATCH | `/admin/staff/time-off` | Requests + approve/deny |
| GET | `/admin/analytics/cohorts` · `/rebooking` · `/mrr` · `/referrals` · `/top-services` · `/busy-hours` | Analytics view |
| GET/POST/PATCH/DELETE | `/admin/coupons` (+`/:id`) | Coupon CRUD |
| GET/PATCH | `/admin/automations` (+`/:id`) | Toggle + edit templates |
| GET/POST | `/admin/waitlist` · `POST /admin/waitlist/:id/offer` | Waitlist + offer slot (SMS w/ 2h hold) |
| GET/PUT | `/admin/forms/templates/:id` | Intake/consent form definition |
| GET | `/admin/forms/submissions` | Submissions with status |
| POST | `/admin/forms/reminders` | Re-send signing link |

---

## Representative request/response examples

### POST /auth/register

```json
// Request
{ "name": "Rachel Nguyen", "email": "rachel.n@example.com", "phone": "+16785550176", "password": "•••••••••", "referralCode": "DANIELLE-25" }

// 201 Response
{
  "user": { "id": "usr_9f2c", "name": "Rachel Nguyen", "email": "rachel.n@example.com", "role": "client" },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "rt_c1a4e0...",
  "referralApplied": { "credit": 2500, "from": "Danielle O." }
}
```

### POST /auth/login → same token shape. POST /auth/refresh

```json
// Request
{ "refreshToken": "rt_c1a4e0..." }
// 200 — old refresh token is invalidated (rotation)
{ "accessToken": "eyJ...", "refreshToken": "rt_88d1..." }
```

### GET /availability

`GET /availability?serviceId=volume-fill&locationId=LAW&artistId=a1&from=2026-07-14&to=2026-07-18`

```json
// 200
{
  "serviceId": "volume-fill",
  "durationMin": 75,
  "slots": [
    { "start": "2026-07-14T13:00:00-04:00", "artistId": "a1", "locationId": "LAW" },
    { "start": "2026-07-14T15:30:00-04:00", "artistId": "a1", "locationId": "LAW" },
    { "start": "2026-07-15T09:00:00-04:00", "artistId": "a1", "locationId": "LAW" }
  ]
}
```

Slot math must account for service duration, artist schedule (Tue–Sun, per-location days), approved time off, and buffer minutes. Omit `artistId` to search all artists.

### POST /appointments

```json
// Request
{
  "serviceId": "volume-fill",
  "artistId": "a1",
  "locationId": "LAW",
  "start": "2026-07-14T13:00:00-04:00",
  "paymentIntentId": "pi_3PZk...",        // deposit, if policy requires
  "notes": "Foam tape please"
}

// 201
{
  "appointment": {
    "id": "apt_7d31", "status": "confirmed",
    "service": { "id": "volume-fill", "name": "Volume Fill", "price": 9500 },
    "artist": { "id": "a1", "name": "Ava Monroe" },
    "location": { "id": "LAW", "name": "Lawrenceville" },
    "start": "2026-07-14T13:00:00-04:00", "end": "2026-07-14T14:15:00-04:00",
    "intakeRequired": false
  }
}
// 409 { "error": { "code": "slot_unavailable", ... } } if taken between availability check and booking
```

`POST /appointments/:id/reschedule` takes `{ "start": "...", "artistId?": "..." }` and re-runs the same conflict check. `POST /appointments/:id/cancel` returns `{ "cancelled": true, "feeCharged": 0 }` — fee logic applies inside the 24-hour window.

### POST /payments/intents (Stripe)

```json
// Request
{ "amount": 9500, "currency": "usd", "purpose": "appointment_deposit", "appointmentDraftId": "drf_2210", "savePaymentMethod": true }

// 201 — client confirms with Stripe.js / Payment Sheet using clientSecret
{ "paymentIntentId": "pi_3PZk...", "clientSecret": "pi_3PZk..._secret_...", "customerId": "cus_QRs2..." }
```

Never trust an amount from the client — the server derives it from the service/gift-card record.

### POST /gift-cards

```json
// Request
{ "amount": 15000, "recipientEmail": "sister@example.com", "message": "Happy birthday", "paymentIntentId": "pi_3Qab..." }
// 201
{ "giftCard": { "code": "SLA-4F7K-9Q2M", "balance": 15000, "expiresAt": null } }
```

### POST /notifications/devices

```json
// Request
{ "platform": "ios", "token": "ExponentPushToken[xxxxxxxxxxxx]", "appVersion": "1.2.0" }
// 201
{ "device": { "id": "dev_51ac", "platform": "ios" } }
```

Store one row per token; prune on `DeviceNotRegistered` receipts from Expo/APNs/FCM.

### GET /admin/appointments

`GET /admin/appointments?date=2026-07-10&locationId=LAW&status=pending`

```json
// 200
{
  "data": [
    {
      "id": "apt_ap04", "start": "2026-07-10T14:30:00-04:00", "status": "pending",
      "client": { "id": "c8", "name": "Rachel Nguyen", "phone": "+16785550176", "intakeStatus": "pending" },
      "service": { "id": "hybrid-fill", "name": "Hybrid Fill", "price": 8500 },
      "artist": { "id": "a2", "name": "Amara Diallo" },
      "location": { "id": "LAW" },
      "notes": "First fill. Intake form still unsigned."
    }
  ],
  "page": { "cursor": null, "total": 1 }
}
```

`PATCH /admin/appointments/:id` body: `{ "status": "confirmed" | "no-show", "notes?": "..." }`. Status transitions are validated server-side (e.g. `completed` can't become `pending`).

### POST /admin/waitlist/:id/offer

```json
// 200 — triggers Twilio SMS with a signed booking link that holds the slot
{ "offer": { "waitlistId": "w1", "slotStart": "2026-07-10T17:00:00-04:00", "holdExpiresAt": "2026-07-10T15:04:00-04:00", "smsSid": "SM8a3..." } }
```

### POST /admin/coupons

```json
// Request
{ "code": "FALLLIFT", "type": "percent", "value": 15, "expiry": "2026-10-31", "maxUses": 100, "note": "Lift + tint, autumn push" }
// 201
{ "coupon": { "id": "cpn_a1b2", "code": "FALLLIFT", "uses": 0, "active": true, "...": "..." } }
```

### PATCH /admin/automations/:id

```json
// Request — toggle and/or template edit
{ "enabled": true, "subject": "We saved your lash map, {{first_name}}", "body": "Hi {{first_name}}, ..." }
// 200 → returns the full automation object; the scheduler reads this table on each run
```

### GET/PUT /admin/forms/templates/:id

Form templates are a JSON field list (`checkbox_group`, `text`, `signature`), which is what the Forms view previews. `GET /admin/forms/submissions?status=pending` powers the submissions table; `POST /admin/forms/reminders` body: `{ "submissionId": "s2" }` or `{ "customerId": "c8" }`.

---

## Webhooks

### Stripe → `POST /webhooks/stripe`

- Verify the `Stripe-Signature` header with the endpoint secret before touching the payload.
- Handle at minimum: `payment_intent.succeeded` (mark deposit paid / issue gift card / post loyalty points at 1 pt per $1), `payment_intent.payment_failed`, `charge.refunded`, and for The Glow Circle via Stripe Billing: `invoice.paid` (extend membership month, grant monthly fill credit), `invoice.payment_failed` + `customer.subscription.deleted` (grace period, then downgrade tier).
- Webhooks are the source of truth for payment state — never mark anything paid from the client callback alone. Make handlers idempotent (store processed event ids).

### Twilio → `POST /webhooks/twilio`

- Validate `X-Twilio-Signature`.
- **Status callbacks** update message delivery state (fill reminders, waitlist offers).
- **Inbound SMS**: `STOP/UNSUBSCRIBE` sets `smsOptIn=false` (legally required); `C`/`CONFIRM` replies can confirm pending appointments; anything else lands in `/messages` for the front desk.

### Expo push receipts

Not a webhook — poll receipts after batch sends and unregister tokens returning `DeviceNotRegistered`.

---

## Non-functional notes

- **Idempotency:** accept an `Idempotency-Key` header on `POST /appointments`, `/payments/intents`, `/gift-cards` — mobile clients retry on flaky networks.
- **Pagination:** cursor-based (`?cursor=&limit=`) on all admin list endpoints.
- **PII/health data:** intake forms contain health disclosures — encrypt at rest, restrict reads to `admin` + assigned artist, and log access. Not HIPAA-covered, but treat it with the same care.
- **Audit log:** append-only record of admin mutations (who changed which appointment/coupon/automation and when).
