# Glow — Lash Studio Mobile App

The client app for **Glow Lash Studio** (Lawrenceville & Duluth, GA). One Expo + TypeScript codebase serving iOS and Android via `expo-router`.

*Wake up beautiful.*

## Features

- **Booking flow** — studio → service → artist → 14-day availability → $30 deposit confirmation, with a reschedule mode reachable from any upcoming appointment
- **Home** — next appointment with reschedule/cancel, loyalty progress, membership status, featured gallery
- **Studio** — before/after gallery and client reviews (with in-app review submission)
- **Messages** — a front-desk thread with mock studio replies
- **Profile** — favorites, masked payment methods, gift card balance and redemption, loyalty & referral (give $25, get $25), intake/consent status, notification preferences, light/dark/system theme
- **Local notifications** — appointment reminders scheduled 24h and 2h before each booking

## Setup

```bash
npm install
npx expo start
```

Then press `i` for the iOS simulator, `a` for Android, or scan the QR code with Expo Go.

**Sign in:** auth is mocked — any valid email plus a password of 6+ characters works. The session token is stored in `expo-secure-store`.

## EAS builds

```bash
npm install -g eas-cli
eas login
eas build:configure          # creates eas.json + links a project id
eas build --platform ios     # bundle id: com.glowlashstudio.app
eas build --platform android # package: com.glowlashstudio.app
```

For push notifications on Android, add FCM credentials via `eas credentials` before building. Local reminder notifications work without any of this.

## What's mocked, and where to wire the real thing

| Area | Today | Production integration point |
|---|---|---|
| API | `src/api/client.ts` resolves every endpoint against `src/data/mock.ts` with simulated latency | Set `BASE_URL`, swap each method body for the provided `request<T>()` helper — signatures already match a REST backend. Bearer token is injected automatically via `setAuthToken()` |
| Auth | Any email + 6-char password returns a fake token | `POST /auth/login`, `/auth/register`, `/auth/forgot-password`; keep the SecureStore persistence as-is |
| Payments | "Add card" appends a masked test card; deposits are simulated | Create a SetupIntent/PaymentIntent server-side, present Stripe **PaymentSheet** (`@stripe/stripe-react-native`) — commented in `src/api/client.ts` and `app/(tabs)/profile.tsx` |
| Push | Local scheduled reminders only | Register `getExpoPushTokenAsync()` with your backend — steps commented in `src/notifications.ts` |
| Availability | Deterministic generator honoring real studio hours (Tue–Fri 9–7, Sat 9–6, Sun 10–4, Mon closed) | `GET /availability?date=&artistId=` |

## Project structure

```
app/                  expo-router routes
  (auth)/             login, register, forgot-password
  (tabs)/             Home, Book, Studio, Messages, Profile
  appointment/[id]    appointment detail
  service/[id]        service detail
src/
  api/client.ts       typed API layer (mock-backed)
  auth/AuthContext.tsx
  components/         themed, accessible UI kit
  data/mock.ts        canonical catalog, artists, availability generator
  notifications.ts    reminder scheduling
  theme/              tokens + ThemeProvider (light/dark/system, persisted)
  types.ts            all entity types
```

Brand palette, pricing, and program details come from `../docs/brand-identity.md` and are treated as canonical.
