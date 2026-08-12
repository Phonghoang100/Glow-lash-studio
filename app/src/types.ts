/**
 * Domain types for Glow Lash Studio.
 * Every entity used by the mock API layer and screens is typed here.
 */

export type LocationId = 'lawrenceville' | 'duluth';

export interface StudioLocation {
  id: LocationId;
  name: string;
  address: string;
  phone: string;
  hours: string;
}

export type ServiceCategory = 'lash-sets' | 'fills' | 'lifts-tints' | 'brows' | 'other';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  /** Fill price for extension sets (2–3 week fill). */
  fillPrice?: number;
  durationMinutes: number;
  /** How long results typically last. */
  longevity: string;
  shortDescription: string;
  description: string;
  aftercare: string[];
}

export interface Artist {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  bio: string;
  avatarUrl: string;
  locations: LocationId[];
  rating: number;
}

export type AppointmentStatus = 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  serviceId: string;
  artistId: string;
  locationId: LocationId;
  /** ISO 8601 start datetime. */
  startsAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  depositPaid: number;
  priceAtBooking: number;
  notes?: string;
}

export type LoyaltyTier = 'Member' | 'Gold' | 'Platinum';

export interface LoyaltyAccount {
  points: number;
  /** Points needed for the next $25 credit. */
  nextRewardAt: number;
  creditBalance: number;
  tier: LoyaltyTier;
  memberSince: string;
  referralCode: string;
}

export interface GiftCard {
  id: string;
  code: string;
  balance: number;
  originalAmount: number;
  purchasedAt: string;
}

export interface Message {
  id: string;
  from: 'client' | 'studio';
  body: string;
  sentAt: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  body: string;
  serviceName: string;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  serviceName: string;
  artistId: string;
  beforeUrl: string;
  afterUrl: string;
}

export interface TimeSlot {
  /** ISO 8601 start datetime. */
  startsAt: string;
  available: boolean;
}

export interface PaymentMethod {
  id: string;
  brand: 'Visa' | 'Mastercard' | 'Amex';
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  favoriteArtistIds: string[];
  favoriteServiceIds: string[];
  intakeFormComplete: boolean;
  consentFormComplete: boolean;
  notificationPreferences: {
    appointmentReminders: boolean;
    promotions: boolean;
    loyaltyUpdates: boolean;
  };
}

export interface AuthSession {
  token: string;
  user: UserProfile;
}

export interface BookingRequest {
  serviceId: string;
  artistId: string;
  locationId: LocationId;
  startsAt: string;
  /** Appointment being replaced when rescheduling. */
  rescheduleOfId?: string;
}
