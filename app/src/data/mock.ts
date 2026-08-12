import { addDays, addHours, setHours, setMinutes, startOfDay, subDays } from 'date-fns';
import {
  Appointment,
  Artist,
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

/**
 * Mock data for Glow Lash Studio.
 * Prices, locations, and program details are canonical — sourced from
 * docs/brand-identity.md. Do not change values here without updating the doc.
 */

export const locations: StudioLocation[] = [
  {
    id: 'lawrenceville',
    name: 'Lawrenceville',
    address: '175 W Crogan St, Suite 210, Lawrenceville, GA 30046',
    phone: '(770) 555-0142',
    hours: 'Tue–Fri 9am–7pm · Sat 9am–6pm · Sun 10am–4pm · Mon closed',
  },
  {
    id: 'duluth',
    name: 'Duluth',
    address: '3550 Peachtree Industrial Blvd, Suite 140, Duluth, GA 30096',
    phone: '(770) 555-0178',
    hours: 'Tue–Fri 9am–7pm · Sat 9am–6pm · Sun 10am–4pm · Mon closed',
  },
];

export const services: Service[] = [
  {
    id: 'classic-set',
    name: 'Classic Set',
    category: 'lash-sets',
    price: 150,
    fillPrice: 70,
    durationMinutes: 120,
    longevity: '3–4 weeks with fills every 2–3 weeks',
    shortDescription: 'One extension per natural lash. Clean, polished definition.',
    description:
      'One premium extension applied to each natural lash for definition that reads as effortlessly yours. Ideal for clients who want a refined, mascara-and-more look with zero morning routine. New-client sets include a consultation and an aftercare kit.',
    aftercare: [
      'Keep lashes dry for the first 24 hours',
      'Cleanse daily with an oil-free lash wash',
      'Brush through each morning with a clean spoolie',
      'Avoid oil-based products near the eyes',
      'Book a fill within 2–3 weeks (≥40% retention required)',
    ],
  },
  {
    id: 'hybrid-set',
    name: 'Hybrid Set',
    category: 'lash-sets',
    price: 185,
    fillPrice: 85,
    durationMinutes: 135,
    longevity: '3–4 weeks with fills every 2–3 weeks',
    shortDescription: 'Classic precision meets volume texture. The studio favorite.',
    description:
      'A tailored mix of classic and handmade volume fans — texture and dimension without full-volume density. The most requested set in both studios, and the most forgiving as it grows out. New-client sets include a consultation and an aftercare kit.',
    aftercare: [
      'Keep lashes dry for the first 24 hours',
      'Cleanse daily with an oil-free lash wash',
      'Brush through each morning with a clean spoolie',
      'Sleep on your back or side, not face-down',
      'Book a fill within 2–3 weeks (≥40% retention required)',
    ],
  },
  {
    id: 'volume-set',
    name: 'Volume Set',
    category: 'lash-sets',
    price: 220,
    fillPrice: 95,
    durationMinutes: 150,
    longevity: '3–4 weeks with fills every 2–3 weeks',
    shortDescription: 'Handmade fans for soft, full, editorial density.',
    description:
      'Featherweight handmade fans of 3–6 ultra-fine extensions per natural lash. Full, soft, and dark — density without weight. Built for clients who want their lashes to be the finished look.',
    aftercare: [
      'Keep lashes dry for the first 24 hours',
      'Cleanse daily with an oil-free lash wash',
      'Brush through each morning with a clean spoolie',
      'Avoid steam rooms and saunas for 48 hours',
      'Book a fill within 2–3 weeks (≥40% retention required)',
    ],
  },
  {
    id: 'mega-volume-set',
    name: 'Mega Volume Set',
    category: 'lash-sets',
    price: 260,
    fillPrice: 110,
    durationMinutes: 180,
    longevity: '3–4 weeks with fills every 2–3 weeks',
    shortDescription: 'Maximum density, still weightless. Our most advanced set.',
    description:
      'Fans of 10+ of the finest-diameter extensions available, placed with couture precision. Dramatic, dense, and still safe for the natural lash. Reserved for our most experienced artists.',
    aftercare: [
      'Keep lashes dry for the first 24 hours',
      'Cleanse daily with an oil-free lash wash',
      'Brush through each morning with a clean spoolie',
      'Avoid steam rooms and saunas for 48 hours',
      'Book a fill within 2–3 weeks (≥40% retention required)',
    ],
  },
  {
    id: 'lash-lift',
    name: 'Lash Lift',
    category: 'lifts-tints',
    price: 95,
    durationMinutes: 60,
    longevity: '6–8 weeks',
    shortDescription: 'Your natural lashes, curled from the root.',
    description:
      'A gentle perm that lifts your natural lashes from the root for weeks of effortless curl. No extensions, no maintenance appointments — just your own lashes at their best.',
    aftercare: [
      'Keep lashes dry and makeup-free for 24 hours',
      'Avoid rubbing your eyes for the first day',
      'Use a nourishing lash serum between appointments',
      'Rebook every 6–8 weeks',
    ],
  },
  {
    id: 'lash-lift-tint',
    name: 'Lash Lift + Tint',
    category: 'lifts-tints',
    price: 115,
    durationMinutes: 75,
    longevity: '6–8 weeks',
    shortDescription: 'Lift plus a rich tint. Mascara, retired.',
    description:
      'The lift, finished with a deep tint that darkens lashes to the tip. The closest thing to waking up in mascara — without wearing any.',
    aftercare: [
      'Keep lashes dry and makeup-free for 24 hours',
      'Avoid oil-based cleansers around the eyes for 48 hours',
      'Use a nourishing lash serum between appointments',
      'Rebook every 6–8 weeks',
    ],
  },
  {
    id: 'lash-tint',
    name: 'Lash Tint',
    category: 'lifts-tints',
    price: 35,
    durationMinutes: 30,
    longevity: '3–4 weeks',
    shortDescription: 'A rich, natural tint for lighter lashes.',
    description:
      'A quick, rich tint that darkens natural lashes for definition without a lift or extensions. A quiet upgrade, done in half an hour.',
    aftercare: [
      'Avoid water on the lashes for 12 hours',
      'Skip oil-based makeup remover for 24 hours',
      'Rebook every 3–4 weeks',
    ],
  },
  {
    id: 'gentle-removal',
    name: 'Gentle Removal',
    category: 'other',
    price: 40,
    durationMinutes: 30,
    longevity: 'One visit',
    shortDescription: 'Safe, professional removal. Free with a new set.',
    description:
      'Professional, damage-free removal of existing extensions using a cream remover — never picking, never pulling. Complimentary when booked with a new set.',
    aftercare: [
      'Expect natural lashes to feel lighter for a day or two',
      'A lash serum helps support natural growth',
    ],
  },
  {
    id: 'brow-lamination',
    name: 'Brow Lamination',
    category: 'brows',
    price: 90,
    durationMinutes: 45,
    longevity: '6–8 weeks',
    shortDescription: 'Brows brushed up, set in place, fuller-looking.',
    description:
      'A restructuring treatment that sets brow hairs in a lifted, brushed-up direction for a fuller, editorial brow that lasts for weeks.',
    aftercare: [
      'Keep brows dry for 24 hours',
      'Brush into place each morning',
      'Apply brow conditioner nightly',
      'Rebook every 6–8 weeks',
    ],
  },
  {
    id: 'brow-shaping',
    name: 'Brow Shaping',
    category: 'brows',
    price: 30,
    durationMinutes: 20,
    longevity: '3–4 weeks',
    shortDescription: 'Precision mapping and shaping, tailored to your face.',
    description:
      'Precision shaping mapped to your bone structure — wax and tweeze, never over-thinned. The quiet detail that finishes every look.',
    aftercare: ['Avoid makeup on the brow area for 12 hours', 'Rebook every 3–4 weeks'],
  },
  {
    id: 'brow-tint',
    name: 'Brow Tint',
    category: 'brows',
    price: 30,
    durationMinutes: 20,
    longevity: '3–4 weeks',
    shortDescription: 'Depth and definition matched to your hair.',
    description:
      'A custom-blended tint that adds depth and fills sparse areas, matched to your hair color and skin tone.',
    aftercare: ['Avoid water on the brows for 12 hours', 'Rebook every 3–4 weeks'],
  },
  {
    id: 'brow-bundle',
    name: 'Lamination + Shape + Tint',
    category: 'brows',
    price: 130,
    durationMinutes: 75,
    longevity: '6–8 weeks',
    shortDescription: 'The complete brow — laminated, shaped, tinted.',
    description:
      'The full brow appointment: lamination for lift, precision shaping, and a custom tint. Everything the brow needs, in one sitting, at a considered price.',
    aftercare: [
      'Keep brows dry for 24 hours',
      'Brush into place each morning',
      'Apply brow conditioner nightly',
      'Rebook every 6–8 weeks',
    ],
  },
  {
    id: 'aftercare-kit',
    name: 'Aftercare Kit',
    category: 'other',
    price: 38,
    durationMinutes: 0,
    longevity: '4–6 weeks of daily use',
    shortDescription: 'Oil-free wash, brush, and spoolies. Included with new sets.',
    description:
      'The studio aftercare kit: oil-free foaming lash wash, a soft cleansing brush, and spoolies. Included with every new-client set; available for repurchase any time.',
    aftercare: ['Use the wash daily', 'Replace the kit every 4–6 weeks'],
  },
];

export const artists: Artist[] = [
  {
    id: 'glow-marchand',
    name: 'Ava Monroe',
    title: 'Founder · Master Lash Artist',
    specialties: ['Mega Volume', 'Volume', 'Corrective work'],
    bio: 'Eleven years behind the lash bed, trained in Paris and Atlanta. NovaLash- and Borboleta-certified. Glow takes a limited book focused on advanced volume and corrective work.',
    avatarUrl: 'https://images.unsplash.com/photo-1589710751893-f9a6770ad71b?w=400&q=80',
    locations: ['lawrenceville', 'duluth'],
    rating: 5.0,
  },
  {
    id: 'amara-fields',
    name: 'Amara Fields',
    title: 'Senior Lash Artist',
    specialties: ['Hybrid', 'Volume', 'Natural-look styling'],
    bio: 'Amara built her following on hybrid sets that photograph beautifully and grow out gracefully. Six years of experience, known for meticulous isolation and gentle hands.',
    avatarUrl: 'https://images.unsplash.com/photo-1639629509821-c54cdd984227?w=400&q=80',
    locations: ['lawrenceville'],
    rating: 4.9,
  },
  {
    id: 'vivienne-cho',
    name: 'Vivienne Cho',
    title: 'Lash & Brow Artist',
    specialties: ['Classic', 'Lash Lifts', 'Brow Lamination'],
    bio: 'Vivienne leads the lift and brow menu at the Duluth studio. Clients come to her for natural results that never announce themselves — they just look rested.',
    avatarUrl: 'https://images.unsplash.com/photo-1674049406467-824ea37c7184?w=400&q=80',
    locations: ['duluth'],
    rating: 4.9,
  },
];

const now = new Date();

export const appointments: Appointment[] = [
  {
    id: 'apt-1001',
    serviceId: 'hybrid-set',
    artistId: 'amara-fields',
    locationId: 'lawrenceville',
    startsAt: setMinutes(setHours(addDays(now, 3), 10), 0).toISOString(),
    durationMinutes: 135,
    status: 'confirmed',
    depositPaid: 30,
    priceAtBooking: 185,
    notes: 'Prefers a cat-eye map. Sensitive to bright light — dim lamp requested.',
  },
  {
    id: 'apt-0904',
    serviceId: 'hybrid-set',
    artistId: 'amara-fields',
    locationId: 'lawrenceville',
    startsAt: setMinutes(setHours(subDays(now, 18), 14), 30).toISOString(),
    durationMinutes: 135,
    status: 'completed',
    depositPaid: 30,
    priceAtBooking: 185,
  },
  {
    id: 'apt-0872',
    serviceId: 'lash-lift-tint',
    artistId: 'vivienne-cho',
    locationId: 'duluth',
    startsAt: setMinutes(setHours(subDays(now, 62), 11), 0).toISOString(),
    durationMinutes: 75,
    status: 'completed',
    depositPaid: 30,
    priceAtBooking: 115,
  },
  {
    id: 'apt-0851',
    serviceId: 'classic-set',
    artistId: 'vivienne-cho',
    locationId: 'duluth',
    startsAt: setMinutes(setHours(subDays(now, 95), 16), 0).toISOString(),
    durationMinutes: 120,
    status: 'cancelled',
    depositPaid: 30,
    priceAtBooking: 150,
  },
];

export const loyaltyAccount: LoyaltyAccount = {
  points: 185,
  nextRewardAt: 250, // 250 points = $25 credit
  creditBalance: 25,
  tier: 'Gold', // The Glow Circle — Gold, $129/mo
  memberSince: subDays(now, 240).toISOString(),
  referralCode: 'GLOW-PHO25',
};

export const giftCards: GiftCard[] = [
  {
    id: 'gc-501',
    code: 'SLA-4F7K-92MB',
    balance: 60,
    originalAmount: 150,
    purchasedAt: subDays(now, 120).toISOString(),
  },
];

export const messages: Message[] = [
  {
    id: 'msg-1',
    from: 'studio',
    body: 'Welcome to Glow. This thread reaches the front desk at both studios — questions, reschedules, anything you need.',
    sentAt: subDays(now, 30).toISOString(),
  },
  {
    id: 'msg-2',
    from: 'client',
    body: 'Hi! Quick question — is it okay to book a fill at 3 weeks, or should I come in sooner?',
    sentAt: subDays(now, 20).toISOString(),
  },
  {
    id: 'msg-3',
    from: 'studio',
    body: 'Three weeks works if you have at least 40% retention. From your last set with Amara, you should be right on schedule. We can look at it when you arrive.',
    sentAt: subDays(now, 20).toISOString(),
  },
  {
    id: 'msg-4',
    from: 'studio',
    body: 'A reminder that your hybrid fill with Amara is coming up. Arrive with clean, makeup-free lashes and we will take care of the rest.',
    sentAt: subDays(now, 1).toISOString(),
  },
];

export const reviews: Review[] = [
  {
    id: 'rev-1',
    author: 'Danielle R.',
    rating: 5,
    serviceName: 'Hybrid Set',
    body: 'Three weeks in and my retention is still excellent. Amara mapped the set to my eye shape and it shows in every photo. The studio itself is calm and immaculate.',
    createdAt: subDays(now, 12).toISOString(),
  },
  {
    id: 'rev-2',
    author: 'Priya S.',
    rating: 5,
    serviceName: 'Volume Set',
    body: 'I have had volume sets in three states. This is the first one that felt weightless from day one. Worth every dollar.',
    createdAt: subDays(now, 25).toISOString(),
  },
  {
    id: 'rev-3',
    author: 'Morgan T.',
    rating: 4,
    serviceName: 'Lash Lift + Tint',
    body: 'Vivienne was gentle and precise. The lift lasted a full seven weeks. Only wish the Duluth studio had Sunday evening hours.',
    createdAt: subDays(now, 41).toISOString(),
  },
  {
    id: 'rev-4',
    author: 'Alexis W.',
    rating: 5,
    serviceName: 'Mega Volume Set',
    body: 'Glow herself did my set. Dense, dark, and somehow still soft. The consultation alone was more thorough than full appointments elsewhere.',
    createdAt: subDays(now, 60).toISOString(),
  },
  {
    id: 'rev-5',
    author: 'Jasmine K.',
    rating: 5,
    serviceName: 'Brow Lamination',
    body: 'The lamination-shape-tint bundle is the best beauty decision I have made this year. My brows look full with zero product.',
    createdAt: subDays(now, 75).toISOString(),
  },
];

export const galleryItems: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Hybrid, cat-eye map',
    serviceName: 'Hybrid Set',
    artistId: 'amara-fields',
    beforeUrl: 'https://images.unsplash.com/photo-1548902378-2ec44c906391?w=600&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1735151226446-1d364b4adc2f?w=600&q=80',
  },
  {
    id: 'gal-2',
    title: 'Soft volume, open-eye map',
    serviceName: 'Volume Set',
    artistId: 'glow-marchand',
    beforeUrl: 'https://images.unsplash.com/photo-1683719312734-e31de63957ab?w=600&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1674049406179-d7bf2c263e71?w=600&q=80',
  },
  {
    id: 'gal-3',
    title: 'Classic, natural map',
    serviceName: 'Classic Set',
    artistId: 'vivienne-cho',
    beforeUrl: 'https://images.unsplash.com/photo-1492618269284-653dce58fd6d?w=600&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1735151225764-eac694642dbf?w=600&q=80',
  },
  {
    id: 'gal-4',
    title: 'Mega volume, full glam',
    serviceName: 'Mega Volume Set',
    artistId: 'glow-marchand',
    beforeUrl: 'https://images.unsplash.com/photo-1567629307995-b9f33097bd30?w=600&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1709477542153-5bedab2b5657?w=600&q=80',
  },
  {
    id: 'gal-5',
    title: 'Lift + tint, no extensions',
    serviceName: 'Lash Lift + Tint',
    artistId: 'vivienne-cho',
    beforeUrl: 'https://images.unsplash.com/photo-1617655345937-95fafc9013f3?w=600&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1561505445-3d89277edf4c?w=600&q=80',
  },
  {
    id: 'gal-6',
    title: 'Laminated brow, brushed up',
    serviceName: 'Brow Lamination',
    artistId: 'vivienne-cho',
    beforeUrl: 'https://images.unsplash.com/photo-1493422884938-abd42cfa0f29?w=600&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1589710751893-f9a6770ad71b?w=600&q=80',
  },
];

export const paymentMethods: PaymentMethod[] = [
  { id: 'pm-1', brand: 'Visa', last4: '4242', expMonth: 8, expYear: 2027, isDefault: true },
  { id: 'pm-2', brand: 'Amex', last4: '1005', expMonth: 3, expYear: 2026, isDefault: false },
];

export const userProfile: UserProfile = {
  id: 'user-1',
  firstName: 'Phong',
  lastName: 'Hoang',
  email: 'phong@example.com',
  phone: '(678) 555-0134',
  favoriteArtistIds: ['amara-fields'],
  favoriteServiceIds: ['hybrid-set'],
  intakeFormComplete: true,
  consentFormComplete: false,
  notificationPreferences: {
    appointmentReminders: true,
    promotions: false,
    loyaltyUpdates: true,
  },
};

/** Studio open/close hours by weekday (0 = Sunday). Null = closed. */
const HOURS_BY_DAY: Record<number, { open: number; close: number } | null> = {
  0: { open: 10, close: 16 }, // Sun 10–4
  1: null, // Mon closed
  2: { open: 9, close: 19 }, // Tue 9–7
  3: { open: 9, close: 19 },
  4: { open: 9, close: 19 },
  5: { open: 9, close: 19 },
  6: { open: 9, close: 18 }, // Sat 9–6
};

/** Deterministic pseudo-random hash so the same day/artist always shows the same slots. */
function slotSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 997;
  }
  return hash;
}

/**
 * Generates bookable time slots for a given date and artist.
 * Slots start every 90 minutes within studio hours; a deterministic hash
 * marks some as taken so the calendar looks realistically busy.
 */
export function generateAvailability(date: Date, artistId: string): TimeSlot[] {
  const hours = HOURS_BY_DAY[date.getDay()];
  if (!hours) {
    return [];
  }
  const slots: TimeSlot[] = [];
  const dayStart = startOfDay(date);
  const dateKey = dayStart.toISOString().slice(0, 10);
  let cursor = addHours(dayStart, hours.open);
  const close = addHours(dayStart, hours.close);

  let index = 0;
  while (cursor.getTime() + 90 * 60 * 1000 <= close.getTime()) {
    const seed = slotSeed(`${dateKey}:${artistId}:${index}`);
    const isPast = cursor.getTime() <= Date.now();
    slots.push({
      startsAt: cursor.toISOString(),
      available: !isPast && seed % 3 !== 0, // roughly a third of slots are taken
    });
    cursor = new Date(cursor.getTime() + 90 * 60 * 1000);
    index += 1;
  }
  return slots;
}

export function findService(id: string): Service | undefined {
  return services.find((service) => service.id === id);
}

export function findArtist(id: string): Artist | undefined {
  return artists.find((artist) => artist.id === id);
}

export function findLocation(id: string): StudioLocation | undefined {
  return locations.find((location) => location.id === id);
}
