import {
  Appointment,
  Artist,
  AuthSession,
  BookingRequest,
  GalleryItem,
  GiftCard,
  LoyaltyAccount,
  Message,
  PaymentMethod,
  Review,
  Service,
  StudioLocation,
  TimeSlot,
  UserProfile,
} from '../types';
import * as mock from '../data/mock';

/**
 * Typed API layer for Glow Lash Studio.
 *
 * Every endpoint below is implemented against in-memory mock data with
 * simulated network latency so screens exercise real loading states.
 *
 * ── Wiring a real backend ────────────────────────────────────────────────
 * 1. Set BASE_URL to your API origin (e.g. https://api.glowlashstudio.com/v1).
 * 2. Replace each mock implementation with a call to `request<T>(...)`
 *    below — the signatures are already what a REST backend would return.
 * 3. The bearer token set via setAuthToken() is injected into every
 *    request automatically; call it after login/refresh.
 *
 * Example real implementation:
 *   async getServices(): Promise<Service[]> {
 *     return request<Service[]>('GET', '/services');
 *   }
 */

// export const BASE_URL = 'https://api.glowlashstudio.com/v1';
export const BASE_URL = 'mock://glow';

let authToken: string | null = null;

/** Store the session token; injected as a Bearer header on real requests. */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

/** Generic fetch wrapper used once a real backend is wired up. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`API ${method} ${path} failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

/** Simulated network latency so loading states are visible in the mock app. */
function delay(ms = 450): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requireAuth(): void {
  if (!authToken) {
    throw new Error('Not authenticated');
  }
}

// Mutable copies so booking/cancel/reschedule/messages behave statefully
// within a session. A real backend owns this state instead.
let appointmentsState: Appointment[] = [...mock.appointments];
let messagesState: Message[] = [...mock.messages];
let reviewsState: Review[] = [...mock.reviews];
let giftCardsState: GiftCard[] = [...mock.giftCards];
let loyaltyState: LoyaltyAccount = { ...mock.loyaltyAccount };
let paymentMethodsState: PaymentMethod[] = [...mock.paymentMethods];
let profileState: UserProfile = { ...mock.userProfile };

let bookingCounter = 2000;

export const api = {
  // ── Auth ────────────────────────────────────────────────────────────────
  // Real: POST /auth/login { email, password } → { token, user }
  async login(email: string, password: string): Promise<AuthSession> {
    await delay(600);
    const trimmed = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      throw new Error('Enter a valid email address.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    profileState = { ...profileState, email: trimmed };
    return { token: `mock-token-${Date.now()}`, user: profileState };
  },

  // Real: POST /auth/register → { token, user }
  async register(firstName: string, lastName: string, email: string, password: string): Promise<AuthSession> {
    await delay(700);
    if (!firstName.trim() || !lastName.trim()) {
      throw new Error('Enter your first and last name.');
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      throw new Error('Enter a valid email address.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    profileState = {
      ...profileState,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
    };
    return { token: `mock-token-${Date.now()}`, user: profileState };
  },

  // Real: POST /auth/forgot-password { email } → 204
  async requestPasswordReset(email: string): Promise<void> {
    await delay(500);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      throw new Error('Enter a valid email address.');
    }
  },

  // ── Profile ─────────────────────────────────────────────────────────────
  // Real: GET /me
  async getProfile(): Promise<UserProfile> {
    requireAuth();
    await delay(300);
    return { ...profileState };
  },

  // Real: PATCH /me
  async updateProfile(update: Partial<UserProfile>): Promise<UserProfile> {
    requireAuth();
    await delay(350);
    profileState = { ...profileState, ...update };
    return { ...profileState };
  },

  async toggleFavoriteArtist(artistId: string): Promise<UserProfile> {
    requireAuth();
    await delay(200);
    const has = profileState.favoriteArtistIds.includes(artistId);
    profileState = {
      ...profileState,
      favoriteArtistIds: has
        ? profileState.favoriteArtistIds.filter((id) => id !== artistId)
        : [...profileState.favoriteArtistIds, artistId],
    };
    return { ...profileState };
  },

  async toggleFavoriteService(serviceId: string): Promise<UserProfile> {
    requireAuth();
    await delay(200);
    const has = profileState.favoriteServiceIds.includes(serviceId);
    profileState = {
      ...profileState,
      favoriteServiceIds: has
        ? profileState.favoriteServiceIds.filter((id) => id !== serviceId)
        : [...profileState.favoriteServiceIds, serviceId],
    };
    return { ...profileState };
  },

  // ── Catalog ─────────────────────────────────────────────────────────────
  // Real: GET /services
  async getServices(): Promise<Service[]> {
    await delay();
    return [...mock.services];
  },

  async getService(id: string): Promise<Service> {
    await delay(300);
    const service = mock.findService(id);
    if (!service) {
      throw new Error('Service not found');
    }
    return service;
  },

  // Real: GET /artists
  async getArtists(): Promise<Artist[]> {
    await delay();
    return [...mock.artists];
  },

  // Real: GET /locations
  async getLocations(): Promise<StudioLocation[]> {
    await delay(250);
    return [...mock.locations];
  },

  // ── Availability ────────────────────────────────────────────────────────
  // Real: GET /availability?date=YYYY-MM-DD&artistId=&locationId=
  async getAvailability(date: Date, artistId: string): Promise<TimeSlot[]> {
    await delay(400);
    return mock.generateAvailability(date, artistId);
  },

  // ── Appointments ────────────────────────────────────────────────────────
  // Real: GET /appointments
  async getAppointments(): Promise<Appointment[]> {
    requireAuth();
    await delay();
    return [...appointmentsState].sort(
      (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
    );
  },

  async getAppointment(id: string): Promise<Appointment> {
    requireAuth();
    await delay(300);
    const appointment = appointmentsState.find((apt) => apt.id === id);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    return appointment;
  },

  /**
   * Real: POST /appointments — the backend charges the $30 deposit via
   * Stripe PaymentIntent before confirming. Here the deposit is simulated.
   */
  async bookAppointment(bookingRequest: BookingRequest): Promise<Appointment> {
    requireAuth();
    await delay(800);
    const service = mock.findService(bookingRequest.serviceId);
    if (!service) {
      throw new Error('Service not found');
    }
    if (bookingRequest.rescheduleOfId) {
      appointmentsState = appointmentsState.map((apt) =>
        apt.id === bookingRequest.rescheduleOfId ? { ...apt, status: 'cancelled' as const } : apt
      );
    }
    bookingCounter += 1;
    const appointment: Appointment = {
      id: `apt-${bookingCounter}`,
      serviceId: bookingRequest.serviceId,
      artistId: bookingRequest.artistId,
      locationId: bookingRequest.locationId,
      startsAt: bookingRequest.startsAt,
      durationMinutes: service.durationMinutes,
      status: 'confirmed',
      depositPaid: 30,
      priceAtBooking: service.price,
    };
    appointmentsState = [appointment, ...appointmentsState];
    return appointment;
  },

  // Real: DELETE /appointments/:id (deposit forfeited within 24h per policy)
  async cancelAppointment(id: string): Promise<void> {
    requireAuth();
    await delay(500);
    appointmentsState = appointmentsState.map((apt) =>
      apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
    );
  },

  // ── Payments ────────────────────────────────────────────────────────────
  // Real: GET /payment-methods (Stripe customer's saved cards)
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    requireAuth();
    await delay(350);
    return [...paymentMethodsState];
  },

  /**
   * Real integration point: create a SetupIntent server-side, then present
   * Stripe's PaymentSheet (@stripe/stripe-react-native) to collect the card.
   * The mock simply appends a masked card.
   */
  async addPaymentMethod(): Promise<PaymentMethod> {
    requireAuth();
    await delay(900);
    const added: PaymentMethod = {
      id: `pm-${Date.now()}`,
      brand: 'Mastercard',
      last4: '4444',
      expMonth: 12,
      expYear: 2028,
      isDefault: false,
    };
    paymentMethodsState = [...paymentMethodsState, added];
    return added;
  },

  // ── Gift cards ──────────────────────────────────────────────────────────
  // Real: GET /gift-cards
  async getGiftCards(): Promise<GiftCard[]> {
    requireAuth();
    await delay(350);
    return [...giftCardsState];
  },

  // Real: POST /gift-cards/redeem { code }
  async redeemGiftCard(code: string): Promise<GiftCard> {
    requireAuth();
    await delay(600);
    const normalized = code.trim().toUpperCase();
    if (normalized.length < 8) {
      throw new Error('That code does not look right. Check the card and try again.');
    }
    const redeemed: GiftCard = {
      id: `gc-${Date.now()}`,
      code: normalized,
      balance: 50,
      originalAmount: 50,
      purchasedAt: new Date().toISOString(),
    };
    giftCardsState = [...giftCardsState, redeemed];
    return redeemed;
  },

  // ── Loyalty & referral ──────────────────────────────────────────────────
  // Real: GET /loyalty
  async getLoyaltyAccount(): Promise<LoyaltyAccount> {
    requireAuth();
    await delay(300);
    return { ...loyaltyState };
  },

  // Real: POST /loyalty/redeem — converts 250 points into a $25 credit
  async redeemLoyaltyPoints(): Promise<LoyaltyAccount> {
    requireAuth();
    await delay(500);
    if (loyaltyState.points < 250) {
      throw new Error('You need 250 points to redeem a $25 credit.');
    }
    loyaltyState = {
      ...loyaltyState,
      points: loyaltyState.points - 250,
      creditBalance: loyaltyState.creditBalance + 25,
    };
    return { ...loyaltyState };
  },

  // ── Messages ────────────────────────────────────────────────────────────
  // Real: GET /messages
  async getMessages(): Promise<Message[]> {
    requireAuth();
    await delay(350);
    return [...messagesState];
  },

  // Real: POST /messages { body } — pushes to the studio's front-desk inbox
  async sendMessage(body: string): Promise<Message[]> {
    requireAuth();
    await delay(400);
    const outgoing: Message = {
      id: `msg-${Date.now()}`,
      from: 'client',
      body: body.trim(),
      sentAt: new Date().toISOString(),
    };
    // Canned front-desk reply so the thread feels alive in the demo.
    const reply: Message = {
      id: `msg-${Date.now() + 1}`,
      from: 'studio',
      body: 'Thank you — the front desk has your message and will reply within the hour during studio time (Tue–Sun).',
      sentAt: new Date(Date.now() + 1200).toISOString(),
    };
    messagesState = [...messagesState, outgoing, reply];
    return [...messagesState];
  },

  // ── Reviews & gallery ───────────────────────────────────────────────────
  // Real: GET /reviews
  async getReviews(): Promise<Review[]> {
    await delay();
    return [...reviewsState];
  },

  // Real: POST /reviews { rating, body, serviceName }
  async submitReview(rating: number, body: string, serviceName: string): Promise<Review[]> {
    requireAuth();
    await delay(600);
    const review: Review = {
      id: `rev-${Date.now()}`,
      author: `${profileState.firstName} ${profileState.lastName.charAt(0)}.`,
      rating,
      body: body.trim(),
      serviceName,
      createdAt: new Date().toISOString(),
    };
    reviewsState = [review, ...reviewsState];
    return [...reviewsState];
  },

  // Real: GET /gallery
  async getGallery(): Promise<GalleryItem[]> {
    await delay();
    return [...mock.galleryItems];
  },
};
