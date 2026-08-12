/* ============================================================
   Glow Lash Studio — Admin Dashboard (functional prototype)
   Vanilla JS, no build step. All state lives in memory (DATA).
   Every mutation point is marked with a "connect to API" comment
   showing the endpoint it maps to in docs/api-spec.md.
   ============================================================ */

"use strict";

/* ------------------------------------------------------------
   0. Constants & helpers
   ------------------------------------------------------------ */

// Prototype clock is pinned so the mock data always lines up.
// In production, use the real date.
const TODAY = "2026-07-10"; // Friday

const LOCATIONS = {
  LAW: { id: "LAW", name: "Lawrenceville", address: "175 W Crogan St, Suite 210, Lawrenceville, GA 30046", phone: "(770) 555-0142" },
  DUL: { id: "DUL", name: "Duluth", address: "3550 Peachtree Industrial Blvd, Suite 140, Duluth, GA 30096", phone: "(770) 555-0178" }
};

const PALETTE = {
  champagne: "#C9A96A",
  champagneDeep: "#A88547",
  espresso: "#2B2521",
  blush: "#E8D5CC",
  stone: "#857A6E",
  porcelain: "#F2ECE3",
  ink: "#443C35"
};

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function money(n) {
  return "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function fmtDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
function fmtDateLong(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
function statusBadge(status) {
  const map = {
    confirmed: ["badge-confirmed", "Confirmed"],
    pending: ["badge-pending", "Pending"],
    completed: ["badge-completed", "Completed"],
    cancelled: ["badge-cancelled", "Cancelled"],
    "no-show": ["badge-noshow", "No-show"]
  };
  const [cls, label] = map[status] || ["badge-none", status];
  return `<span class="badge ${cls}">${label}</span>`;
}
function tierBadge(tier) {
  if (tier === "Gold") return '<span class="badge badge-gold">Gold</span>';
  if (tier === "Platinum") return '<span class="badge badge-platinum">Platinum</span>';
  return '<span class="badge badge-none">—</span>';
}
function intakeBadge(status) {
  return status === "signed"
    ? '<span class="badge badge-signed">Signed</span>'
    : '<span class="badge badge-pending">Pending</span>';
}

/* ------------------------------------------------------------
   1. Mock data module
   ------------------------------------------------------------ */

const DATA = {

  services: [
    { id: "classic-full",  name: "Classic Set",            price: 150, dur: 120 },
    { id: "classic-fill",  name: "Classic Fill",           price: 70,  dur: 60 },
    { id: "hybrid-full",   name: "Hybrid Set",             price: 185, dur: 135 },
    { id: "hybrid-fill",   name: "Hybrid Fill",            price: 85,  dur: 65 },
    { id: "volume-full",   name: "Volume Set",             price: 220, dur: 150 },
    { id: "volume-fill",   name: "Volume Fill",            price: 95,  dur: 75 },
    { id: "mega-full",     name: "Mega Volume Set",        price: 260, dur: 165 },
    { id: "mega-fill",     name: "Mega Volume Fill",       price: 110, dur: 80 },
    { id: "lash-lift",     name: "Lash Lift",              price: 95,  dur: 60 },
    { id: "lift-tint",     name: "Lash Lift + Tint",       price: 115, dur: 75 },
    { id: "lash-tint",     name: "Lash Tint",              price: 35,  dur: 20 },
    { id: "removal",       name: "Gentle Removal",         price: 40,  dur: 30 },
    { id: "brow-lam",      name: "Brow Lamination",        price: 90,  dur: 50 },
    { id: "brow-shape",    name: "Brow Shaping",           price: 30,  dur: 20 },
    { id: "brow-tint",     name: "Brow Tint",              price: 30,  dur: 20 },
    { id: "brow-bundle",   name: "Lamination + Shape + Tint", price: 130, dur: 75 }
  ],

  artists: [
    {
      id: "a1", name: "Ava Monroe", role: "Master Lash Artist · Founder", utilization: 92,
      schedule: { Tue: { loc: "LAW", hrs: "9a–7p" }, Wed: { loc: "LAW", hrs: "9a–7p" }, Thu: { loc: "DUL", hrs: "9a–7p" }, Fri: { loc: "LAW", hrs: "9a–7p" }, Sat: { loc: "DUL", hrs: "9a–6p" }, Sun: null }
    },
    {
      id: "a2", name: "Amara Diallo", role: "Senior Lash Artist", utilization: 84,
      schedule: { Tue: { loc: "LAW", hrs: "9a–7p" }, Wed: { loc: "DUL", hrs: "9a–7p" }, Thu: { loc: "LAW", hrs: "9a–7p" }, Fri: { loc: "LAW", hrs: "11a–7p" }, Sat: { loc: "LAW", hrs: "9a–6p" }, Sun: { loc: "LAW", hrs: "10a–4p" } }
    },
    {
      id: "a3", name: "Vivian Cho", role: "Lash & Brow Artist", utilization: 71,
      schedule: { Tue: { loc: "DUL", hrs: "9a–7p" }, Wed: { loc: "DUL", hrs: "9a–7p" }, Thu: null, Fri: { loc: "DUL", hrs: "9a–7p" }, Sat: { loc: "DUL", hrs: "9a–6p" }, Sun: { loc: "DUL", hrs: "10a–4p" } }
    }
  ],

  timeOff: [
    { id: "t1", artistId: "a3", range: "Jul 21 – Jul 23, 2026", reason: "Family travel", status: "pending" },
    { id: "t2", artistId: "a2", range: "Aug 4, 2026", reason: "Continuing education — mega volume workshop", status: "pending" },
    { id: "t3", artistId: "a1", range: "Jun 16 – Jun 18, 2026", reason: "NovaLash recertification", status: "approved" }
  ],

  customers: [
    { id: "c1", name: "Amelia Grant",    phone: "(678) 555-0121", email: "amelia.g@example.com",  visits: 24, ltv: 3120, points: 180, tier: "Platinum", lastVisit: "2026-07-01", intake: "signed", intakeDate: "2024-03-12", flags: [], notes: "Prefers Glow. Sensitive to under-eye gel pads — use foam tape. Books 3 weeks out." },
    { id: "c2", name: "Danielle Osei",   phone: "(470) 555-0182", email: "danielle.o@example.com", visits: 15, ltv: 1980, points: 95,  tier: "Gold",     lastVisit: "2026-07-08", intake: "signed", intakeDate: "2024-11-02", flags: [], notes: "Volume 9–11mm, C curl. Referred 3 clients this year." },
    { id: "c3", name: "Priya Raman",     phone: "(770) 555-0165", email: "priya.r@example.com",   visits: 9,  ltv: 1240, points: 240, tier: "Gold",     lastVisit: "2026-06-27", intake: "signed", intakeDate: "2025-05-19", flags: [], notes: "Hybrid, natural look for work. Duluth only." },
    { id: "c4", name: "Morgan Bellamy",  phone: "(404) 555-0139", email: "morgan.b@example.com",  visits: 6,  ltv: 780,  points: 30,  tier: "None",     lastVisit: "2026-05-28", intake: "signed", intakeDate: "2025-09-30", flags: ["Lapsing — 43 days since last visit"], notes: "Was on a 3-week fill cadence; missed last two windows. Win-back candidate." },
    { id: "c5", name: "Keisha Whitfield",phone: "(678) 555-0147", email: "keisha.w@example.com",  visits: 31, ltv: 4485, points: 85,  tier: "Platinum", lastVisit: "2026-07-05", intake: "signed", intakeDate: "2023-08-14", flags: [], notes: "Mega volume regular. Birthday Aug 22 — birthday lash bath due." },
    { id: "c6", name: "Lauren Tisdale",  phone: "(770) 555-0113", email: "lauren.t@example.com",  visits: 3,  ltv: 355,  points: 105, tier: "None",     lastVisit: "2026-06-30", intake: "signed", intakeDate: "2026-04-21", flags: ["Low retention at last fill — review aftercare"], notes: "Retention under 40% at last fill; walked through oil-free aftercare, gifted aftercare kit." },
    { id: "c7", name: "Sofia Andrade",   phone: "(470) 555-0158", email: "sofia.a@example.com",   visits: 12, ltv: 1410, points: 160, tier: "Gold",     lastVisit: "2026-07-09", intake: "signed", intakeDate: "2025-01-08", flags: [], notes: "Lash lift + tint every 7 weeks. Prefers Vivian." },
    { id: "c8", name: "Rachel Nguyen",   phone: "(678) 555-0176", email: "rachel.n@example.com",  visits: 1,  ltv: 185,  points: 185, tier: "None",     lastVisit: "2026-07-03", intake: "pending", intakeDate: null, flags: ["Consent form pending before next appointment"], notes: "New client — hybrid set. Send intake reminder before first fill." },
    { id: "c9", name: "Tamara Fields",   phone: "(404) 555-0192", email: "tamara.f@example.com",  visits: 19, ltv: 2350, points: 100, tier: "Gold",     lastVisit: "2026-07-07", intake: "signed", intakeDate: "2024-06-25", flags: [], notes: "Classic only — prefers the most natural map. Quiet appointment; no small talk." },
    { id: "c10", name: "Erin Kowalski",  phone: "(770) 555-0129", email: "erin.k@example.com",    visits: 7,  ltv: 890,  points: 140, tier: "None",     lastVisit: "2026-04-19", intake: "signed", intakeDate: "2025-07-02", flags: ["Win-back — 82 days since last visit"], notes: "Moved to Suwanee; suggested Duluth studio. Win-back email sent Jun 8." },
    { id: "c11", name: "Jade Thompson",  phone: "(678) 555-0107", email: "jade.t@example.com",    visits: 2,  ltv: 250,  points: 250, tier: "None",     lastVisit: "2026-07-06", intake: "pending", intakeDate: null, flags: [], notes: "Referred by Danielle Osei — apply give-$25/get-$25 credit on next visit." },
    { id: "c12", name: "Whitney Park",   phone: "(470) 555-0134", email: "whitney.p@example.com", visits: 11, ltv: 1495, points: 245, tier: "Gold",     lastVisit: "2026-07-10", intake: "signed", intakeDate: "2025-02-17", flags: [], notes: "Brow lamination bundle + volume fills. 5 points from a $25 reward." }
  ],

  // status: confirmed | pending | completed | cancelled | no-show
  appointments: [
    // Today — Friday, Jul 10 (Lawrenceville: Glow + Amara / Duluth: Vivian)
    { id: "ap01", date: "2026-07-10", time: "9:00 AM",  clientId: "c12", artistId: "a1", serviceId: "volume-fill",  loc: "LAW", status: "completed", intake: "signed",  notes: "Retention ~55%. Rebooked for Jul 31." },
    { id: "ap02", date: "2026-07-10", time: "10:30 AM", clientId: "c1",  artistId: "a1", serviceId: "mega-fill",    loc: "LAW", status: "completed", intake: "signed",  notes: "Foam tape used per client note." },
    { id: "ap03", date: "2026-07-10", time: "1:00 PM",  clientId: "c9",  artistId: "a1", serviceId: "classic-fill", loc: "LAW", status: "confirmed", intake: "signed",  notes: "" },
    { id: "ap04", date: "2026-07-10", time: "2:30 PM",  clientId: "c8",  artistId: "a2", serviceId: "hybrid-fill",  loc: "LAW", status: "pending",   intake: "pending", notes: "First fill. Intake form still unsigned — must sign on arrival." },
    { id: "ap05", date: "2026-07-10", time: "4:00 PM",  clientId: "c2",  artistId: "a2", serviceId: "volume-fill",  loc: "LAW", status: "confirmed", intake: "signed",  notes: "" },
    { id: "ap06", date: "2026-07-10", time: "11:00 AM", clientId: "c7",  artistId: "a3", serviceId: "lift-tint",    loc: "DUL", status: "confirmed", intake: "signed",  notes: "7-week cadence; last lift May 22." },
    { id: "ap07", date: "2026-07-10", time: "3:30 PM",  clientId: "c3",  artistId: "a3", serviceId: "brow-bundle",  loc: "DUL", status: "confirmed", intake: "signed",  notes: "" },

    // Tomorrow — Saturday, Jul 11 (Glow at Duluth, Amara at Lawrenceville, Vivian Duluth)
    { id: "ap08", date: "2026-07-11", time: "9:30 AM",  clientId: "c5",  artistId: "a1", serviceId: "mega-fill",    loc: "DUL", status: "confirmed", intake: "signed",  notes: "" },
    { id: "ap09", date: "2026-07-11", time: "11:30 AM", clientId: "c11", artistId: "a3", serviceId: "hybrid-fill",  loc: "DUL", status: "pending",   intake: "pending", notes: "Apply referral credit (Danielle Osei)." },
    { id: "ap10", date: "2026-07-11", time: "1:00 PM",  clientId: "c6",  artistId: "a2", serviceId: "classic-fill", loc: "LAW", status: "confirmed", intake: "signed",  notes: "Check retention — flagged last visit." },

    // Next week
    { id: "ap11", date: "2026-07-14", time: "10:00 AM", clientId: "c4",  artistId: "a2", serviceId: "hybrid-full",  loc: "LAW", status: "pending",   intake: "signed",  notes: "Returning after 6+ weeks — lapsed past fill window, booked as full set." },
    { id: "ap12", date: "2026-07-14", time: "2:00 PM",  clientId: "c10", artistId: "a3", serviceId: "lash-lift",    loc: "DUL", status: "pending",   intake: "signed",  notes: "Win-back conversion — from Jun 8 email." },
    { id: "ap13", date: "2026-07-15", time: "9:00 AM",  clientId: "c1",  artistId: "a1", serviceId: "brow-shape",   loc: "LAW", status: "confirmed", intake: "signed",  notes: "" },
    { id: "ap14", date: "2026-07-16", time: "5:00 PM",  clientId: "c2",  artistId: "a1", serviceId: "volume-fill",  loc: "DUL", status: "confirmed", intake: "signed",  notes: "" },

    // Earlier this week (history)
    { id: "ap15", date: "2026-07-09", time: "10:00 AM", clientId: "c7",  artistId: "a3", serviceId: "brow-tint",    loc: "DUL", status: "completed", intake: "signed",  notes: "" },
    { id: "ap16", date: "2026-07-08", time: "1:30 PM",  clientId: "c2",  artistId: "a2", serviceId: "volume-fill",  loc: "DUL", status: "completed", intake: "signed",  notes: "" },
    { id: "ap17", date: "2026-07-08", time: "4:30 PM",  clientId: "c3",  artistId: "a3", serviceId: "hybrid-fill",  loc: "DUL", status: "completed", intake: "signed",  notes: "" },
    { id: "ap18", date: "2026-07-07", time: "9:30 AM",  clientId: "c9",  artistId: "a1", serviceId: "classic-fill", loc: "LAW", status: "completed", intake: "signed",  notes: "" },
    { id: "ap19", date: "2026-07-07", time: "3:00 PM",  clientId: "c10", artistId: "a2", serviceId: "removal",      loc: "LAW", status: "no-show",   intake: "signed",  notes: "No-show; no-show fee not charged (first offense)." },
    { id: "ap20", date: "2026-07-07", time: "5:30 PM",  clientId: "c6",  artistId: "a2", serviceId: "aftercare",    loc: "LAW", status: "cancelled", intake: "signed",  notes: "Client cancelled 26h ahead — within policy." }
  ],

  waitlist: [
    { id: "w1", name: "Bianca Reeves",  phone: "(678) 555-0163", serviceId: "volume-full", artistId: "a1", loc: "LAW", window: "Any weekday after 4pm", offered: false },
    { id: "w2", name: "Hannah Lieu",    phone: "(770) 555-0151", serviceId: "lift-tint",   artistId: "a3", loc: "DUL", window: "Sat or Sun, mornings", offered: false },
    { id: "w3", name: "Gabrielle Fox",  phone: "(404) 555-0118", serviceId: "hybrid-full", artistId: null, loc: "LAW", window: "This week, flexible", offered: true },
    { id: "w4", name: "Renee Calhoun",  phone: "(470) 555-0186", serviceId: "mega-full",   artistId: "a1", loc: "DUL", window: "Saturdays only", offered: false }
  ],

  // 12 trailing weeks of revenue by location (week-beginning labels)
  weeklyRevenue: {
    labels: ["Apr 20", "Apr 27", "May 4", "May 11", "May 18", "May 25", "Jun 1", "Jun 8", "Jun 15", "Jun 22", "Jun 29", "Jul 6"],
    law:    [4620, 4890, 5140, 4750, 5310, 5580, 5220, 5470, 5760, 5590, 6010, 6240],
    dul:    [3110, 3350, 3280, 3540, 3690, 3480, 3820, 3950, 4120, 4060, 4310, 4480]
  },

  serviceMix: {
    labels: ["Volume", "Hybrid", "Classic", "Mega Volume", "Lifts & Tints", "Brows"],
    values: [34, 26, 18, 8, 9, 5]
  },

  kpis: {
    weekRevenue: 10720,       // Jul 6 week, both studios
    newClientsWeek: 9,
    avgTicket: 138,
    fillRate: 87,             // booked slots ÷ available slots
    noShowRate: 2.4
  },

  analytics: {
    rebookingRate: 68,        // % of clients who rebook before leaving
    members: { gold: 34, platinum: 18 },  // MRR derived: 34×$129 + 18×$199
    referrals: { invitesSent: 112, signups: 41, converted: 29 },
    cohorts: {
      // % of cohort still active in month N after first visit
      rows: [
        { label: "Jan 2026", size: 38, vals: [100, 71, 63, 58, 55, 53] },
        { label: "Feb 2026", size: 41, vals: [100, 74, 66, 61, 57, null] },
        { label: "Mar 2026", size: 45, vals: [100, 76, 69, 63, null, null] },
        { label: "Apr 2026", size: 39, vals: [100, 72, 64, null, null, null] },
        { label: "May 2026", size: 52, vals: [100, 78, null, null, null, null] },
        { label: "Jun 2026", size: 47, vals: [100, null, null, null, null, null] }
      ]
    },
    topServices: [
      { name: "Volume Fill", count: 214, revenue: 20330 },
      { name: "Hybrid Fill", count: 168, revenue: 14280 },
      { name: "Volume Set", count: 61, revenue: 13420 },
      { name: "Classic Fill", count: 149, revenue: 10430 },
      { name: "Lash Lift + Tint", count: 74, revenue: 8510 },
      { name: "Mega Volume Set", count: 26, revenue: 6760 }
    ],
    // Busiest hours: rows Tue–Sun, cols 9a–6p, intensity 0–4
    heatmap: {
      days: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      hours: ["9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p"],
      values: [
        [2, 2, 3, 2, 2, 2, 3, 3, 4, 3],
        [1, 2, 2, 2, 3, 2, 2, 3, 3, 2],
        [2, 2, 2, 3, 2, 2, 3, 3, 4, 3],
        [2, 3, 3, 3, 3, 3, 4, 4, 4, 3],
        [4, 4, 4, 3, 3, 3, 3, 2, 2, 1],
        [0, 3, 3, 2, 2, 2, 1, 0, 0, 0]
      ]
    }
  },

  coupons: [
    { id: "cp1", code: "WELCOME25",  type: "fixed",   value: 25, expiry: "2026-12-31", uses: 48, maxUses: null, note: "New-client welcome credit" },
    { id: "cp2", code: "REFER25",    type: "fixed",   value: 25, expiry: "2026-12-31", uses: 41, maxUses: null, note: "Referral — give $25, get $25" },
    { id: "cp3", code: "SUMMERLIFT", type: "percent", value: 15, expiry: "2026-07-31", uses: 22, maxUses: 100,  note: "Lash lift + tint, July only" },
    { id: "cp4", code: "CIRCLEGUEST", type: "fixed",  value: 40, expiry: "2026-09-30", uses: 6,  maxUses: 36,   note: "Platinum guest pass" }
  ],

  automations: [
    {
      id: "au1", name: "Welcome series", channel: "Email", enabled: true,
      trigger: "3 emails over 14 days after first appointment",
      subject: "Welcome to Glow — your aftercare guide",
      body: "Hi {{first_name}},\n\nThank you for trusting us with your first set. Your aftercare kit has everything you need — here is how to use it.\n\nKeep lashes dry for 24 hours, cleanse nightly with the foam in your kit, and avoid oil-based products near the eyes.\n\nYour fill window opens {{fill_window_date}}. Book anytime at glowlashstudio.com.\n\n— Glow Lash Studio"
    },
    {
      id: "au2", name: "2-week fill reminder", channel: "SMS", enabled: true,
      trigger: "14 days after last completed lash appointment",
      subject: "",
      body: "Glow Lash Studio: Hi {{first_name}} — your fill window is open. Fills booked within 3 weeks keep your set full and your price at fill rate. Book: {{booking_link}} Reply STOP to opt out."
    },
    {
      id: "au3", name: "Win-back — 45 days", channel: "Email", enabled: true,
      trigger: "45 days with no future appointment on the books",
      subject: "We saved your lash map, {{first_name}}",
      body: "Hi {{first_name}},\n\nIt has been a little while. Your lash map and preferences are saved with your artist, so picking back up is simple.\n\nIf your lashes have fully shed, we recommend a fresh set — removal is complimentary with any new set.\n\nBook when you are ready: {{booking_link}}\n\n— Glow"
    },
    {
      id: "au4", name: "Birthday", channel: "Email", enabled: true,
      trigger: "7 days before client birthday",
      subject: "A birthday lash bath, on us",
      body: "Happy almost-birthday, {{first_name}}.\n\nCome in during your birthday month for a complimentary lash bath and a small gift from us. Circle members: your birthday perk is waiting on your account.\n\nReserve your visit: {{booking_link}}\n\n— Glow Lash Studio"
    },
    {
      id: "au5", name: "Review request", channel: "SMS", enabled: false,
      trigger: "3 hours after appointment is marked completed",
      subject: "",
      body: "Glow Lash Studio: Thank you for visiting today, {{first_name}}. If you loved your set, a short Google review helps our small studio more than you know: {{review_link}} Reply STOP to opt out."
    }
  ],

  intakeForm: {
    title: "New Client Intake & Consent",
    sub: "Required before your first lash or brow service. Reviewed by your artist at consultation.",
    contraindications: [
      "Eye surgery or LASIK within the last 90 days",
      "Active eye infection, stye, blepharitis, or conjunctivitis",
      "Chemotherapy or radiation within the last 6 months",
      "Alopecia areata affecting the lash line",
      "Known allergy to cyanoacrylate adhesive or latex",
      "Currently using prescription lash growth serum (e.g., Latisse)",
      "Chronically watery eyes or untreated glaucoma",
      "Pregnant or nursing (service still possible — positioning adjusted)"
    ],
    consents: [
      "I understand lash extensions are applied to my natural lashes and require proper aftercare.",
      "I have disclosed all known allergies and medical conditions above.",
      "I consent to a patch test being offered, and I may decline it at my own discretion.",
      "I understand the 24-hour cancellation policy and no-show fee.",
      "I consent to before/after photos for my client record (marketing use requires separate opt-in)."
    ]
  },

  submissions: [
    { id: "s1", clientId: "c12", form: "Intake & Consent", date: "2026-07-10", status: "signed" },
    { id: "s2", clientId: "c8",  form: "Intake & Consent", date: null,          status: "pending" },
    { id: "s3", clientId: "c11", form: "Intake & Consent", date: null,          status: "pending" },
    { id: "s4", clientId: "c7",  form: "Lash Lift Consent", date: "2026-07-09", status: "signed" },
    { id: "s5", clientId: "c2",  form: "Photo Release",     date: "2026-07-08", status: "signed" },
    { id: "s6", clientId: "c5",  form: "Intake & Consent (annual renewal)", date: "2026-07-05", status: "signed" }
  ]
};

/* Lookup helpers */
const svcById = id => DATA.services.find(s => s.id === id) || { name: id === "aftercare" ? "Aftercare Kit" : id, price: 0 };
const artistById = id => DATA.artists.find(a => a.id === id);
const custById = id => DATA.customers.find(c => c.id === id);

/* ------------------------------------------------------------
   2. Auth (mock)
   ------------------------------------------------------------ */

const loginScreen = document.getElementById("login-screen");
const appEl = document.getElementById("app");

document.getElementById("login-form").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const errEl = document.getElementById("login-error");
  // connect to API: POST /v1/auth/login → { accessToken, refreshToken }
  if (email === "admin@glowlashstudio.com") {
    errEl.hidden = true;
    loginScreen.hidden = true;
    appEl.hidden = false;
    document.getElementById("topbar-date").textContent = fmtDateLong(TODAY);
    navigate("overview");
  } else {
    errEl.hidden = false;
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  // connect to API: POST /v1/auth/logout (revoke refresh token)
  appEl.hidden = true;
  loginScreen.hidden = false;
  document.getElementById("login-password").value = "";
});

/* ------------------------------------------------------------
   3. Router / navigation
   ------------------------------------------------------------ */

const VIEW_TITLES = {
  overview: "Overview",
  appointments: "Appointments",
  customers: "Customers",
  staff: "Staff",
  analytics: "Analytics",
  marketing: "Marketing",
  forms: "Forms"
};

const viewEl = document.getElementById("view");
let charts = [];

function destroyCharts() {
  charts.forEach(c => c.destroy());
  charts = [];
}

function navigate(view) {
  destroyCharts();
  closeDrawer();
  closeModal();
  document.querySelectorAll(".nav-item").forEach(btn => {
    if (btn.dataset.view === view) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });
  document.getElementById("view-title").textContent = VIEW_TITLES[view];
  const renderers = {
    overview: renderOverview,
    appointments: renderAppointments,
    customers: renderCustomers,
    staff: renderStaff,
    analytics: renderAnalytics,
    marketing: renderMarketing,
    forms: renderForms
  };
  renderers[view]();
  viewEl.focus({ preventScroll: true });
}

document.querySelectorAll(".nav-item").forEach(btn =>
  btn.addEventListener("click", () => navigate(btn.dataset.view))
);

/* ------------------------------------------------------------
   4. Drawer, modal, toast
   ------------------------------------------------------------ */

const drawer = document.getElementById("drawer");
const drawerOverlay = document.getElementById("drawer-overlay");
const modal = document.getElementById("modal");
const modalOverlay = document.getElementById("modal-overlay");

function openDrawer(title, html) {
  document.getElementById("drawer-title").textContent = title;
  document.getElementById("drawer-body").innerHTML = html;
  drawer.hidden = false;
  drawerOverlay.hidden = false;
  document.getElementById("drawer-close").focus();
}
function closeDrawer() {
  drawer.hidden = true;
  drawerOverlay.hidden = true;
}
function openModal(title, html) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = html;
  modal.hidden = false;
  modalOverlay.hidden = false;
  document.getElementById("modal-close").focus();
}
function closeModal() {
  modal.hidden = true;
  modalOverlay.hidden = true;
}
document.getElementById("drawer-close").addEventListener("click", closeDrawer);
document.getElementById("modal-close").addEventListener("click", closeModal);
drawerOverlay.addEventListener("click", closeDrawer);
modalOverlay.addEventListener("click", closeModal);
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeDrawer(); closeModal(); }
});

let toastTimer;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
}

/* ------------------------------------------------------------
   5. Overview
   ------------------------------------------------------------ */

function renderOverview() {
  const todays = DATA.appointments
    .filter(a => a.date === TODAY && a.status !== "cancelled")
    .sort((a, b) => toMinutes(a.time) - toMinutes(b.time));

  viewEl.innerHTML = `
    <div class="kpi-grid">
      ${kpiCard("Today’s appointments", todays.length, "Both studios")}
      ${kpiCard("Week revenue", money(DATA.kpis.weekRevenue), "+8.2% vs prior week", "up")}
      ${kpiCard("New clients (wk)", DATA.kpis.newClientsWeek, "+2 vs prior week", "up")}
      ${kpiCard("Avg ticket", money(DATA.kpis.avgTicket), "Trailing 30 days")}
      ${kpiCard("Fill rate", DATA.kpis.fillRate + "%", "Booked ÷ available slots")}
      ${kpiCard("No-show rate", DATA.kpis.noShowRate + "%", "−0.6 pts vs prior month", "up")}
    </div>

    <div class="grid-3-2">
      <section class="card">
        <h3 class="card-title">Revenue — trailing 12 weeks</h3>
        <div class="chart-box"><canvas id="chart-revenue" role="img" aria-label="Line chart of weekly revenue for Lawrenceville and Duluth over 12 weeks"></canvas></div>
      </section>
      <section class="card">
        <h3 class="card-title">Service mix</h3>
        <div class="chart-box"><canvas id="chart-mix" role="img" aria-label="Doughnut chart of appointment share by service category"></canvas></div>
      </section>
    </div>

    <div class="grid-3-2">
      <section class="card">
        <h3 class="card-title">Location comparison — weekly revenue</h3>
        <div class="chart-box"><canvas id="chart-loc" role="img" aria-label="Bar chart comparing Lawrenceville and Duluth weekly revenue over the last six weeks"></canvas></div>
      </section>
      <section class="card">
        <h3 class="card-title">Today’s schedule</h3>
        <ul class="sched-list">
          ${todays.map(a => {
            const c = custById(a.clientId), s = svcById(a.serviceId), art = artistById(a.artistId);
            return `<li>
              <span class="sched-time">${esc(a.time)}</span>
              <div class="sched-main">
                <div class="sched-client">${esc(c.name)}</div>
                <div class="sched-svc">${esc(s.name)} · ${esc(art.name.split(" ")[0])} · ${esc(LOCATIONS[a.loc].name)}</div>
              </div>
              ${statusBadge(a.status)}
            </li>`;
          }).join("") || '<li class="empty">No appointments today.</li>'}
        </ul>
      </section>
    </div>
  `;

  const gridColor = "rgba(133, 122, 110, 0.15)";
  const baseTicks = { color: PALETTE.stone, font: { family: "Jost", size: 11 } };

  charts.push(new Chart(document.getElementById("chart-revenue"), {
    type: "line",
    data: {
      labels: DATA.weeklyRevenue.labels,
      datasets: [
        { label: "Lawrenceville", data: DATA.weeklyRevenue.law, borderColor: PALETTE.champagne, backgroundColor: "rgba(201,169,106,0.12)", fill: true, tension: 0.35, pointRadius: 2 },
        { label: "Duluth", data: DATA.weeklyRevenue.dul, borderColor: PALETTE.espresso, backgroundColor: "rgba(43,37,33,0.05)", fill: true, tension: 0.35, pointRadius: 2 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: PALETTE.ink, font: { family: "Jost", size: 12 }, boxWidth: 12 } } },
      scales: {
        x: { ticks: baseTicks, grid: { display: false } },
        y: { ticks: { ...baseTicks, callback: v => "$" + (v / 1000) + "k" }, grid: { color: gridColor } }
      }
    }
  }));

  charts.push(new Chart(document.getElementById("chart-mix"), {
    type: "doughnut",
    data: {
      labels: DATA.serviceMix.labels,
      datasets: [{
        data: DATA.serviceMix.values,
        backgroundColor: [PALETTE.champagne, PALETTE.espresso, PALETTE.blush, PALETTE.champagneDeep, PALETTE.stone, PALETTE.porcelain],
        borderColor: "#FAF7F2", borderWidth: 2
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: "62%",
      plugins: { legend: { position: "right", labels: { color: PALETTE.ink, font: { family: "Jost", size: 12 }, boxWidth: 12 } } }
    }
  }));

  const last6 = -6;
  charts.push(new Chart(document.getElementById("chart-loc"), {
    type: "bar",
    data: {
      labels: DATA.weeklyRevenue.labels.slice(last6),
      datasets: [
        { label: "Lawrenceville", data: DATA.weeklyRevenue.law.slice(last6), backgroundColor: PALETTE.champagne, borderRadius: 3 },
        { label: "Duluth", data: DATA.weeklyRevenue.dul.slice(last6), backgroundColor: PALETTE.blush, borderRadius: 3 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: PALETTE.ink, font: { family: "Jost", size: 12 }, boxWidth: 12 } } },
      scales: {
        x: { ticks: baseTicks, grid: { display: false } },
        y: { ticks: { ...baseTicks, callback: v => "$" + (v / 1000) + "k" }, grid: { color: gridColor } }
      }
    }
  }));
}

function kpiCard(label, value, note, dir) {
  return `<div class="kpi">
    <span class="eyebrow">${esc(label)}</span>
    <div class="kpi-value">${value}</div>
    ${note ? `<div class="kpi-note${dir ? " " + dir : ""}">${esc(note)}</div>` : ""}
  </div>`;
}

function toMinutes(t) {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  let h = +m[1] % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + +m[2];
}

/* ------------------------------------------------------------
   6. Appointments
   ------------------------------------------------------------ */

const apptFilters = { date: "all", loc: "all", artist: "all", status: "all" };

function renderAppointments() {
  viewEl.innerHTML = `
    <div class="filters">
      <div class="field">
        <label for="f-date">Date</label>
        <select id="f-date">
          <option value="all">All dates</option>
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="week">Next 7 days</option>
          <option value="past">Past</option>
        </select>
      </div>
      <div class="field">
        <label for="f-loc">Location</label>
        <select id="f-loc">
          <option value="all">Both studios</option>
          <option value="LAW">Lawrenceville</option>
          <option value="DUL">Duluth</option>
        </select>
      </div>
      <div class="field">
        <label for="f-artist">Artist</label>
        <select id="f-artist">
          <option value="all">All artists</option>
          ${DATA.artists.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label for="f-status">Status</label>
        <select id="f-status">
          <option value="all">All statuses</option>
          <option>confirmed</option><option>pending</option><option>completed</option>
          <option>cancelled</option><option value="no-show">no-show</option>
        </select>
      </div>
    </div>

    <section class="card">
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th scope="col">Date</th><th scope="col">Time</th><th scope="col">Client</th>
            <th scope="col">Service</th><th scope="col">Artist</th><th scope="col">Location</th>
            <th scope="col">Intake</th><th scope="col">Status</th>
          </tr></thead>
          <tbody id="appt-rows"></tbody>
        </table>
      </div>
    </section>

    <section class="card mt">
      <div class="card-head-row">
        <h3 class="card-title">Waitlist</h3>
        <span class="muted small">${DATA.waitlist.filter(w => !w.offered).length} waiting</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th scope="col">Client</th><th scope="col">Service</th><th scope="col">Preferred artist</th>
            <th scope="col">Location</th><th scope="col">Window</th><th scope="col">Status</th><th scope="col"><span class="sr-only">Action</span></th>
          </tr></thead>
          <tbody id="waitlist-rows"></tbody>
        </table>
      </div>
    </section>
  `;

  ["f-date", "f-loc", "f-artist", "f-status"].forEach(id => {
    const key = { "f-date": "date", "f-loc": "loc", "f-artist": "artist", "f-status": "status" }[id];
    const el = document.getElementById(id);
    el.value = apptFilters[key];
    el.addEventListener("change", () => { apptFilters[key] = el.value; drawApptRows(); });
  });

  drawApptRows();
  drawWaitlist();
}

function filteredAppointments() {
  return DATA.appointments.filter(a => {
    if (apptFilters.loc !== "all" && a.loc !== apptFilters.loc) return false;
    if (apptFilters.artist !== "all" && a.artistId !== apptFilters.artist) return false;
    if (apptFilters.status !== "all" && a.status !== apptFilters.status) return false;
    if (apptFilters.date === "today" && a.date !== TODAY) return false;
    if (apptFilters.date === "tomorrow" && a.date !== "2026-07-11") return false;
    if (apptFilters.date === "week" && (a.date < TODAY || a.date > "2026-07-17")) return false;
    if (apptFilters.date === "past" && a.date >= TODAY) return false;
    return true;
  }).sort((a, b) => a.date === b.date ? toMinutes(a.time) - toMinutes(b.time) : a.date.localeCompare(b.date));
}

function drawApptRows() {
  const rows = filteredAppointments();
  document.getElementById("appt-rows").innerHTML = rows.map(a => {
    const c = custById(a.clientId), s = svcById(a.serviceId), art = artistById(a.artistId);
    return `<tr class="row-click" data-appt="${a.id}" tabindex="0" role="button" aria-label="Open appointment for ${esc(c.name)}">
      <td>${fmtDate(a.date)}</td><td>${esc(a.time)}</td><td>${esc(c.name)}</td>
      <td>${esc(s.name)}</td><td>${esc(art.name)}</td>
      <td><span class="badge badge-loc">${esc(LOCATIONS[a.loc].name)}</span></td>
      <td>${intakeBadge(a.intake)}</td><td>${statusBadge(a.status)}</td>
    </tr>`;
  }).join("") || `<tr><td colspan="8" class="empty">No appointments match these filters.</td></tr>`;

  document.querySelectorAll("[data-appt]").forEach(tr => {
    const open = () => openApptDrawer(tr.dataset.appt);
    tr.addEventListener("click", open);
    tr.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
}

function openApptDrawer(id) {
  const a = DATA.appointments.find(x => x.id === id);
  const c = custById(a.clientId), s = svcById(a.serviceId), art = artistById(a.artistId);
  const done = a.status === "completed" || a.status === "cancelled" || a.status === "no-show";

  openDrawer("Appointment", `
    <ul class="detail-list">
      <li><span>Client</span><span>${esc(c.name)}<br><span class="muted small">${esc(c.phone)}</span></span></li>
      <li><span>Service</span><span>${esc(s.name)} · ${money(s.price)}</span></li>
      <li><span>When</span><span>${fmtDate(a.date)} · ${esc(a.time)}</span></li>
      <li><span>Artist</span><span>${esc(art.name)}</span></li>
      <li><span>Studio</span><span>${esc(LOCATIONS[a.loc].name)}</span></li>
      <li><span>Intake</span><span>${intakeBadge(a.intake)}</span></li>
      <li><span>Status</span><span>${statusBadge(a.status)}</span></li>
    </ul>

    <div class="drawer-section">
      <h4>Notes</h4>
      <p class="note-block">${esc(a.notes || "No notes for this appointment.")}</p>
    </div>

    ${done ? "" : `
    <div class="drawer-section">
      <h4>Actions</h4>
      <div class="drawer-actions">
        ${a.status === "pending" ? `<button type="button" class="btn btn-primary btn-sm" id="act-confirm">Confirm</button>` : ""}
        <button type="button" class="btn btn-sm" id="act-resched">Reschedule</button>
        <button type="button" class="btn btn-sm btn-danger" id="act-cancel">Cancel</button>
        <button type="button" class="btn btn-sm btn-danger" id="act-noshow">Mark no-show</button>
      </div>
    </div>`}
  `);

  const bind = (btnId, fn) => { const b = document.getElementById(btnId); if (b) b.addEventListener("click", fn); };

  bind("act-confirm", () => {
    a.status = "confirmed"; // connect to API: PATCH /v1/admin/appointments/:id { status: "confirmed" }
    toast(`Appointment confirmed — confirmation SMS queued to ${c.name}.`);
    closeDrawer(); drawApptRows();
  });
  bind("act-cancel", () => {
    a.status = "cancelled"; // connect to API: POST /v1/appointments/:id/cancel
    toast("Appointment cancelled. Slot released to waitlist matching.");
    closeDrawer(); drawApptRows();
  });
  bind("act-noshow", () => {
    a.status = "no-show"; // connect to API: PATCH /v1/admin/appointments/:id { status: "no-show" }
    toast("Marked as no-show. No-show policy applies at next booking.");
    closeDrawer(); drawApptRows();
  });
  bind("act-resched", () => openRescheduleModal(a));
}

function openRescheduleModal(a) {
  const times = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM"];
  openModal("Reschedule appointment", `
    <form id="resched-form">
      <div class="field-row">
        <div class="field">
          <label for="rs-date">New date</label>
          <input type="date" id="rs-date" value="${a.date}" min="${TODAY}" required>
        </div>
        <div class="field">
          <label for="rs-time">New time</label>
          <select id="rs-time">${times.map(t => `<option${t === a.time ? " selected" : ""}>${t}</option>`).join("")}</select>
        </div>
      </div>
      <p class="muted small">In production this list would come from the availability endpoint and only show open slots for ${esc(artistById(a.artistId).name)}.</p>
      <div class="drawer-actions mt">
        <button type="submit" class="btn btn-primary btn-sm">Save new time</button>
        <button type="button" class="btn btn-sm" id="rs-cancel">Back</button>
      </div>
    </form>
  `);
  document.getElementById("rs-cancel").addEventListener("click", closeModal);
  document.getElementById("resched-form").addEventListener("submit", e => {
    e.preventDefault();
    a.date = document.getElementById("rs-date").value;
    a.time = document.getElementById("rs-time").value;
    a.status = "confirmed";
    // connect to API: POST /v1/appointments/:id/reschedule { date, time }
    toast(`Rescheduled to ${fmtDate(a.date)} at ${a.time}. Client notified.`);
    closeModal(); closeDrawer(); drawApptRows();
  });
}

function drawWaitlist() {
  document.getElementById("waitlist-rows").innerHTML = DATA.waitlist.map(w => {
    const s = svcById(w.serviceId);
    const art = w.artistId ? artistById(w.artistId).name : "Any artist";
    return `<tr>
      <td>${esc(w.name)}<br><span class="muted small">${esc(w.phone)}</span></td>
      <td>${esc(s.name)}</td><td>${esc(art)}</td>
      <td><span class="badge badge-loc">${esc(LOCATIONS[w.loc].name)}</span></td>
      <td>${esc(w.window)}</td>
      <td>${w.offered ? '<span class="badge badge-offered">Slot offered</span>' : '<span class="badge badge-none">Waiting</span>'}</td>
      <td>${w.offered ? "" : `<button type="button" class="btn btn-sm" data-offer="${w.id}">Offer slot</button>`}</td>
    </tr>`;
  }).join("");

  document.querySelectorAll("[data-offer]").forEach(btn =>
    btn.addEventListener("click", () => {
      const w = DATA.waitlist.find(x => x.id === btn.dataset.offer);
      w.offered = true;
      // connect to API: POST /v1/admin/waitlist/:id/offer → sends SMS with 2h booking hold
      toast(`Open-slot SMS sent to ${w.name}. Hold expires in 2 hours.`);
      drawWaitlist();
    })
  );
}

/* ------------------------------------------------------------
   7. Customers
   ------------------------------------------------------------ */

let customerQuery = "";

function renderCustomers() {
  viewEl.innerHTML = `
    <div class="filters">
      <div class="field search-input">
        <label for="cust-search">Search clients</label>
        <input type="search" id="cust-search" placeholder="Name or phone…" value="${esc(customerQuery)}">
      </div>
    </div>
    <section class="card">
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th scope="col">Client</th><th scope="col">Phone</th>
            <th scope="col" class="num">Visits</th><th scope="col" class="num">LTV</th>
            <th scope="col" class="num">Points</th><th scope="col">Membership</th>
            <th scope="col">Last visit</th><th scope="col">Intake</th>
          </tr></thead>
          <tbody id="cust-rows"></tbody>
        </table>
      </div>
    </section>
  `;
  const input = document.getElementById("cust-search");
  input.addEventListener("input", () => { customerQuery = input.value; drawCustRows(); });
  drawCustRows();
}

function drawCustRows() {
  const q = customerQuery.trim().toLowerCase();
  const rows = DATA.customers.filter(c =>
    !q || c.name.toLowerCase().includes(q) || c.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "") || "∅")
  );
  document.getElementById("cust-rows").innerHTML = rows.map(c => `
    <tr class="row-click" data-cust="${c.id}" tabindex="0" role="button" aria-label="Open profile for ${esc(c.name)}">
      <td>${esc(c.name)}${c.flags.length ? ' <span class="badge badge-flag">Flag</span>' : ""}</td>
      <td>${esc(c.phone)}</td>
      <td class="num">${c.visits}</td>
      <td class="num">${money(c.ltv)}</td>
      <td class="num">${c.points}</td>
      <td>${tierBadge(c.tier)}</td>
      <td>${fmtDate(c.lastVisit)}</td>
      <td>${intakeBadge(c.intake)}</td>
    </tr>
  `).join("") || `<tr><td colspan="8" class="empty">No clients match “${esc(customerQuery)}”.</td></tr>`;

  document.querySelectorAll("[data-cust]").forEach(tr => {
    const open = () => openCustomerDrawer(tr.dataset.cust);
    tr.addEventListener("click", open);
    tr.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
}

function openCustomerDrawer(id) {
  const c = custById(id);
  const history = DATA.appointments
    .filter(a => a.clientId === id)
    .sort((a, b) => b.date.localeCompare(a.date));

  openDrawer(c.name, `
    <ul class="detail-list">
      <li><span>Phone</span><span>${esc(c.phone)}</span></li>
      <li><span>Email</span><span>${esc(c.email)}</span></li>
      <li><span>Visits</span><span>${c.visits}</span></li>
      <li><span>Lifetime value</span><span>${money(c.ltv)}</span></li>
      <li><span>Loyalty</span><span>${c.points} pts <span class="muted small">(250 = $25 credit)</span></span></li>
      <li><span>Membership</span><span>${tierBadge(c.tier)}</span></li>
      <li><span>Last visit</span><span>${fmtDate(c.lastVisit)}</span></li>
      <li><span>Intake & consent</span><span>${intakeBadge(c.intake)}
        ${c.intake === "signed"
          ? `<button type="button" class="link-btn" id="view-intake">View</button>`
          : `<button type="button" class="link-btn" id="send-intake">Send reminder</button>`}
      </span></li>
    </ul>

    ${c.flags.length ? `
    <div class="drawer-section">
      <h4>Retention flags</h4>
      ${c.flags.map(f => `<p class="note-block" style="margin-bottom:0.5rem">${esc(f)}</p>`).join("")}
    </div>` : ""}

    <div class="drawer-section">
      <h4>Notes</h4>
      <p class="note-block">${esc(c.notes)}</p>
    </div>

    <div class="drawer-section">
      <h4>Appointment history</h4>
      <ul class="history-list">
        ${history.map(a => `<li>
          <span>${fmtDate(a.date)} · ${esc(svcById(a.serviceId).name)}</span>
          <span class="muted">${esc(artistById(a.artistId).name.split(" ")[0])} · ${statusBadge(a.status)}</span>
        </li>`).join("") || '<li class="muted">No recent appointments in this window.</li>'}
      </ul>
    </div>
  `);

  const viewBtn = document.getElementById("view-intake");
  if (viewBtn) viewBtn.addEventListener("click", () => openSignedIntakeModal(c));
  const remindBtn = document.getElementById("send-intake");
  if (remindBtn) remindBtn.addEventListener("click", () => {
    // connect to API: POST /v1/admin/forms/reminders { customerId }
    toast(`Intake form link re-sent to ${c.name} by SMS and email.`);
  });
}

function openSignedIntakeModal(c) {
  const f = DATA.intakeForm;
  openModal(`Signed form — ${c.name}`, `
    <div class="form-preview" style="border:none;padding:0;max-width:none">
      <h3>${esc(f.title)}</h3>
      <p class="fp-sub">Signed ${c.intakeDate ? fmtDateLong(c.intakeDate) : "—"} · stored encrypted at rest in production.</p>
      <div class="fp-section">
        <span class="fp-label">Health &amp; contraindications</span>
        ${f.contraindications.map((item, i) => `
          <div class="fp-check"><input type="checkbox" disabled ${i === 5 && c.id === "c1" ? "checked" : ""} id="m-ci-${i}"><label for="m-ci-${i}">${esc(item)}</label></div>
        `).join("")}
      </div>
      <div class="fp-section">
        <span class="fp-label">Allergies disclosed</span>
        <p class="note-block">${c.id === "c1" ? "Adhesive sensitivity to gel pads (uses foam tape)." : "None disclosed."}</p>
      </div>
      <div class="signature-line"><span class="sig-script">${esc(c.name)}</span><span>Client signature</span></div>
    </div>
  `);
}

/* ------------------------------------------------------------
   8. Staff
   ------------------------------------------------------------ */

function renderStaff() {
  const days = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  viewEl.innerHTML = `
    ${DATA.artists.map(a => `
      <section class="card artist-card">
        <div class="artist-head">
          <div class="artist-avatar" aria-hidden="true">${esc(a.name.split(" ").map(w => w[0]).join(""))}</div>
          <div class="artist-meta">
            <h3 class="artist-name">${esc(a.name)}</h3>
            <p class="artist-role">${esc(a.role)}</p>
          </div>
          <div class="util-wrap">
            <span class="eyebrow">Utilization — ${a.utilization}%</span>
            <div class="util-bar" role="img" aria-label="${a.utilization} percent of bookable hours filled">
              <div class="util-fill" style="width:${a.utilization}%"></div>
            </div>
          </div>
        </div>
        <div class="week-grid">
          ${days.map(d => {
            const s = a.schedule[d];
            return s
              ? `<div class="week-cell loc-${s.loc}"><span class="day">${d}</span><strong>${esc(LOCATIONS[s.loc].name)}</strong><span class="hrs">${esc(s.hrs)}</span></div>`
              : `<div class="week-cell off"><span class="day">${d}</span>Off</div>`;
          }).join("")}
        </div>
      </section>
    `).join("")}

    <section class="card">
      <h3 class="card-title">Time-off requests</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th scope="col">Artist</th><th scope="col">Dates</th><th scope="col">Reason</th><th scope="col">Status</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
          <tbody id="timeoff-rows"></tbody>
        </table>
      </div>
      <p class="muted small mt">Studios are closed Mondays. Approving time off releases those slots from online booking and notifies affected clients.</p>
    </section>
  `;
  drawTimeOff();
}

function drawTimeOff() {
  document.getElementById("timeoff-rows").innerHTML = DATA.timeOff.map(t => `
    <tr>
      <td>${esc(artistById(t.artistId).name)}</td>
      <td>${esc(t.range)}</td>
      <td>${esc(t.reason)}</td>
      <td>${t.status === "approved" ? '<span class="badge badge-confirmed">Approved</span>'
          : t.status === "denied" ? '<span class="badge badge-noshow">Denied</span>'
          : '<span class="badge badge-pending">Pending</span>'}</td>
      <td>${t.status === "pending" ? `
        <button type="button" class="btn btn-sm btn-primary" data-to-approve="${t.id}">Approve</button>
        <button type="button" class="btn btn-sm" data-to-deny="${t.id}">Deny</button>` : ""}</td>
    </tr>
  `).join("");

  document.querySelectorAll("[data-to-approve]").forEach(b => b.addEventListener("click", () => {
    const t = DATA.timeOff.find(x => x.id === b.dataset.toApprove);
    t.status = "approved"; // connect to API: PATCH /v1/admin/staff/time-off/:id { status: "approved" }
    toast(`Time off approved for ${artistById(t.artistId).name}. Booking calendar updated.`);
    drawTimeOff();
  }));
  document.querySelectorAll("[data-to-deny]").forEach(b => b.addEventListener("click", () => {
    const t = DATA.timeOff.find(x => x.id === b.dataset.toDeny);
    t.status = "denied"; // connect to API: PATCH /v1/admin/staff/time-off/:id { status: "denied" }
    toast("Request denied. Artist notified.");
    drawTimeOff();
  }));
}

/* ------------------------------------------------------------
   9. Analytics
   ------------------------------------------------------------ */

function renderAnalytics() {
  const an = DATA.analytics;
  const mrr = an.members.gold * 129 + an.members.platinum * 199;

  viewEl.innerHTML = `
    <div class="kpi-grid">
      ${kpiCard("Rebooking rate", an.rebookingRate + "%", "Clients who rebook before leaving")}
      ${kpiCard("Membership MRR", money(mrr), `${an.members.gold} Gold · ${an.members.platinum} Platinum`)}
      ${kpiCard("Referral conversions", an.referrals.converted, `${an.referrals.invitesSent} invites → ${an.referrals.signups} signups`)}
      ${kpiCard("Referral close rate", Math.round(an.referrals.converted / an.referrals.invitesSent * 100) + "%", "Invite → first appointment")}
    </div>

    <section class="card">
      <h3 class="card-title">Retention cohorts — % of new clients still active</h3>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th scope="col">First-visit cohort</th><th scope="col" class="num">Clients</th>
            ${[0, 1, 2, 3, 4, 5].map(n => `<th scope="col" class="num">M${n}</th>`).join("")}
          </tr></thead>
          <tbody>
            ${an.cohorts.rows.map(r => `
              <tr>
                <td>${esc(r.label)}</td><td class="num">${r.size}</td>
                ${r.vals.map(v => v === null
                  ? `<td class="num muted">—</td>`
                  : `<td class="num cohort-cell" style="background:rgba(201,169,106,${(v / 100 * 0.55).toFixed(2)})">${v}%</td>`
                ).join("")}
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <p class="muted small mt">M<em>n</em> = share of the cohort with at least one completed appointment in month <em>n</em> after their first visit. Fill cadence of 2–3 weeks means healthy cohorts hold above 55% by M3.</p>
    </section>

    <div class="grid-2 mt">
      <section class="card">
        <h3 class="card-title">Top services — trailing 90 days</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th scope="col">Service</th><th scope="col" class="num">Booked</th><th scope="col" class="num">Revenue</th></tr></thead>
            <tbody>
              ${an.topServices.map(s => `<tr><td>${esc(s.name)}</td><td class="num">${s.count}</td><td class="num">${money(s.revenue)}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h3 class="card-title">Busiest hours — both studios</h3>
        <div class="heatmap" role="img" aria-label="Heatmap of booking demand by day and hour. Friday afternoons and Saturday mornings are busiest.">
          <div></div>
          ${an.heatmap.hours.map(h => `<div class="hm-hour">${h}</div>`).join("")}
          ${an.heatmap.days.map((d, ri) => `
            <div class="hm-label">${d}</div>
            ${an.heatmap.values[ri].map(v => `<div class="hm-cell hm-${v}" title="${d} — demand ${v} of 4"></div>`).join("")}
          `).join("")}
        </div>
        <div class="hm-legend">
          Quiet <div class="hm-cell hm-0"></div><div class="hm-cell hm-1"></div><div class="hm-cell hm-2"></div><div class="hm-cell hm-3"></div><div class="hm-cell hm-4"></div> Peak
        </div>
      </section>
    </div>
  `;
}

/* ------------------------------------------------------------
   10. Marketing
   ------------------------------------------------------------ */

function renderMarketing() {
  viewEl.innerHTML = `
    <section class="card">
      <div class="card-head-row">
        <h3 class="card-title">Coupons</h3>
        <button type="button" class="btn btn-primary btn-sm" id="coupon-new">New coupon</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th scope="col">Code</th><th scope="col">Type</th><th scope="col" class="num">Value</th>
            <th scope="col">Expires</th><th scope="col" class="num">Uses</th><th scope="col">Note</th>
            <th scope="col"><span class="sr-only">Actions</span></th>
          </tr></thead>
          <tbody id="coupon-rows"></tbody>
        </table>
      </div>
    </section>

    <section class="card mt">
      <h3 class="card-title">Email &amp; SMS automations</h3>
      <div id="automation-list"></div>
      <p class="muted small mt">Templates support merge tags: {{first_name}}, {{booking_link}}, {{fill_window_date}}, {{review_link}}. SMS sends include opt-out language automatically.</p>
    </section>
  `;

  document.getElementById("coupon-new").addEventListener("click", () => openCouponModal(null));
  drawCoupons();
  drawAutomations();
}

function drawCoupons() {
  document.getElementById("coupon-rows").innerHTML = DATA.coupons.map(cp => `
    <tr>
      <td><strong>${esc(cp.code)}</strong></td>
      <td>${cp.type === "percent" ? "Percent off" : "Fixed amount"}</td>
      <td class="num">${cp.type === "percent" ? cp.value + "%" : money(cp.value)}</td>
      <td>${fmtDate(cp.expiry)}</td>
      <td class="num">${cp.uses}${cp.maxUses ? " / " + cp.maxUses : ""}</td>
      <td class="muted">${esc(cp.note)}</td>
      <td>
        <button type="button" class="btn btn-sm" data-cp-edit="${cp.id}">Edit</button>
        <button type="button" class="btn btn-sm btn-danger" data-cp-del="${cp.id}">Delete</button>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="7" class="empty">No active coupons.</td></tr>`;

  document.querySelectorAll("[data-cp-edit]").forEach(b =>
    b.addEventListener("click", () => openCouponModal(DATA.coupons.find(c => c.id === b.dataset.cpEdit))));
  document.querySelectorAll("[data-cp-del]").forEach(b =>
    b.addEventListener("click", () => {
      const cp = DATA.coupons.find(c => c.id === b.dataset.cpDel);
      if (confirm(`Delete coupon ${cp.code}? Existing holders will no longer be able to redeem it.`)) {
        DATA.coupons = DATA.coupons.filter(c => c.id !== cp.id);
        // connect to API: DELETE /v1/admin/coupons/:id
        toast(`Coupon ${cp.code} deleted.`);
        drawCoupons();
      }
    }));
}

function openCouponModal(cp) {
  const isNew = !cp;
  openModal(isNew ? "New coupon" : `Edit ${cp.code}`, `
    <form id="coupon-form">
      <div class="field">
        <label for="cp-code">Code</label>
        <input id="cp-code" required pattern="[A-Za-z0-9-]{3,20}" value="${cp ? esc(cp.code) : ""}" placeholder="e.g. FALLLIFT" style="text-transform:uppercase">
      </div>
      <div class="field-row">
        <div class="field">
          <label for="cp-type">Type</label>
          <select id="cp-type">
            <option value="fixed"${cp && cp.type === "fixed" ? " selected" : ""}>Fixed amount ($)</option>
            <option value="percent"${cp && cp.type === "percent" ? " selected" : ""}>Percent off (%)</option>
          </select>
        </div>
        <div class="field">
          <label for="cp-value">Value</label>
          <input id="cp-value" type="number" min="1" max="100" required value="${cp ? cp.value : 25}">
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label for="cp-expiry">Expires</label>
          <input id="cp-expiry" type="date" required value="${cp ? cp.expiry : "2026-12-31"}" min="${TODAY}">
        </div>
        <div class="field">
          <label for="cp-max">Max uses (blank = unlimited)</label>
          <input id="cp-max" type="number" min="1" value="${cp && cp.maxUses ? cp.maxUses : ""}">
        </div>
      </div>
      <div class="field">
        <label for="cp-note">Internal note</label>
        <input id="cp-note" value="${cp ? esc(cp.note) : ""}">
      </div>
      <div class="drawer-actions">
        <button type="submit" class="btn btn-primary btn-sm">${isNew ? "Create coupon" : "Save changes"}</button>
        <button type="button" class="btn btn-sm" id="cp-cancel">Cancel</button>
      </div>
    </form>
  `);
  document.getElementById("cp-cancel").addEventListener("click", closeModal);
  document.getElementById("coupon-form").addEventListener("submit", e => {
    e.preventDefault();
    const payload = {
      code: document.getElementById("cp-code").value.trim().toUpperCase(),
      type: document.getElementById("cp-type").value,
      value: +document.getElementById("cp-value").value,
      expiry: document.getElementById("cp-expiry").value,
      maxUses: document.getElementById("cp-max").value ? +document.getElementById("cp-max").value : null,
      note: document.getElementById("cp-note").value.trim()
    };
    if (isNew) {
      DATA.coupons.push({ id: "cp" + Date.now(), uses: 0, ...payload });
      // connect to API: POST /v1/admin/coupons
      toast(`Coupon ${payload.code} created.`);
    } else {
      Object.assign(cp, payload);
      // connect to API: PATCH /v1/admin/coupons/:id
      toast(`Coupon ${payload.code} updated.`);
    }
    closeModal(); drawCoupons();
  });
}

function drawAutomations() {
  document.getElementById("automation-list").innerHTML = DATA.automations.map(au => `
    <div class="automation-row">
      <div class="automation-main">
        <span class="automation-channel">${esc(au.channel)}</span>
        <div class="automation-name">${esc(au.name)}</div>
        <div class="automation-desc">${esc(au.trigger)}</div>
      </div>
      <button type="button" class="btn btn-sm" data-au-edit="${au.id}">Edit template</button>
      <label class="toggle">
        <input type="checkbox" data-au-toggle="${au.id}" ${au.enabled ? "checked" : ""} aria-label="Enable ${esc(au.name)} automation">
        <span class="toggle-track"></span>
      </label>
    </div>
  `).join("");

  document.querySelectorAll("[data-au-toggle]").forEach(input =>
    input.addEventListener("change", () => {
      const au = DATA.automations.find(a => a.id === input.dataset.auToggle);
      au.enabled = input.checked;
      // connect to API: PATCH /v1/admin/automations/:id { enabled }
      toast(`${au.name} ${au.enabled ? "enabled" : "paused"}.`);
    }));

  document.querySelectorAll("[data-au-edit]").forEach(btn =>
    btn.addEventListener("click", () => {
      const au = DATA.automations.find(a => a.id === btn.dataset.auEdit);
      openModal(`Edit — ${au.name}`, `
        <form id="au-form">
          ${au.channel === "Email" ? `
          <div class="field">
            <label for="au-subject">Subject line</label>
            <input id="au-subject" required value="${esc(au.subject)}">
          </div>` : ""}
          <div class="field">
            <label for="au-body">${au.channel === "SMS" ? "Message (SMS)" : "Body"}</label>
            <textarea id="au-body" rows="${au.channel === "SMS" ? 4 : 9}" required>${esc(au.body)}</textarea>
          </div>
          <p class="muted small">Merge tags: {{first_name}}, {{booking_link}}, {{fill_window_date}}, {{review_link}}</p>
          <div class="drawer-actions mt">
            <button type="submit" class="btn btn-primary btn-sm">Save template</button>
            <button type="button" class="btn btn-sm" id="au-cancel">Cancel</button>
          </div>
        </form>
      `);
      document.getElementById("au-cancel").addEventListener("click", closeModal);
      document.getElementById("au-form").addEventListener("submit", e => {
        e.preventDefault();
        const subjectEl = document.getElementById("au-subject");
        if (subjectEl) au.subject = subjectEl.value;
        au.body = document.getElementById("au-body").value;
        // connect to API: PATCH /v1/admin/automations/:id { subject, body }
        toast(`${au.name} template saved.`);
        closeModal();
      });
    }));
}

/* ------------------------------------------------------------
   11. Forms
   ------------------------------------------------------------ */

function renderForms() {
  const f = DATA.intakeForm;

  viewEl.innerHTML = `
    <div class="grid-3-2">
      <section class="card">
        <div class="card-head-row">
          <h3 class="card-title">Form builder — live preview</h3>
          <span class="muted small">Sent to every new client at booking</span>
        </div>
        <div class="form-preview">
          <h3>${esc(f.title)}</h3>
          <p class="fp-sub">${esc(f.sub)}</p>

          <div class="fp-section">
            <fieldset>
              <legend>Health &amp; contraindications — check any that apply</legend>
              ${f.contraindications.map((item, i) => `
                <div class="fp-check">
                  <input type="checkbox" id="fp-ci-${i}">
                  <label for="fp-ci-${i}">${esc(item)}</label>
                </div>`).join("")}
            </fieldset>
          </div>

          <div class="fp-section">
            <label class="fp-label" for="fp-allergies">Allergies &amp; sensitivities</label>
            <textarea id="fp-allergies" rows="3" style="width:100%;padding:0.65rem 0.8rem;border:1px solid var(--line);border-radius:4px;font-family:inherit" placeholder="List any known allergies (adhesives, latex, tints, dyes)…"></textarea>
          </div>

          <div class="fp-section">
            <fieldset>
              <legend>Consent</legend>
              ${f.consents.map((item, i) => `
                <div class="fp-check">
                  <input type="checkbox" id="fp-co-${i}">
                  <label for="fp-co-${i}">${esc(item)}</label>
                </div>`).join("")}
            </fieldset>
          </div>

          <div class="signature-line"><span>Client signature &amp; date</span></div>
        </div>
        <p class="muted small mt">This is a static preview. In production, fields are defined in the form builder and rendered on web and in the app; signatures are captured as vector strokes and stored encrypted. <!-- connect to API: GET/PUT /v1/admin/forms/templates/:id --></p>
      </section>

      <section class="card">
        <h3 class="card-title">Submissions</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th scope="col">Client</th><th scope="col">Form</th><th scope="col">Submitted</th><th scope="col">Status</th><th scope="col"><span class="sr-only">Action</span></th></tr></thead>
            <tbody id="sub-rows"></tbody>
          </table>
        </div>
      </section>
    </div>
  `;
  drawSubmissions();
}

function drawSubmissions() {
  document.getElementById("sub-rows").innerHTML = DATA.submissions.map(s => {
    const c = custById(s.clientId);
    return `<tr>
      <td>${esc(c.name)}</td>
      <td>${esc(s.form)}</td>
      <td>${s.date ? fmtDate(s.date) : '<span class="muted">—</span>'}</td>
      <td>${intakeBadge(s.status)}</td>
      <td>${s.status === "signed"
        ? `<button type="button" class="btn btn-sm" data-sub-view="${s.id}">View</button>`
        : `<button type="button" class="btn btn-sm" data-sub-remind="${s.id}">Remind</button>`}</td>
    </tr>`;
  }).join("");

  document.querySelectorAll("[data-sub-view]").forEach(b => b.addEventListener("click", () => {
    const s = DATA.submissions.find(x => x.id === b.dataset.subView);
    openSignedIntakeModal(custById(s.clientId));
  }));
  document.querySelectorAll("[data-sub-remind]").forEach(b => b.addEventListener("click", () => {
    const s = DATA.submissions.find(x => x.id === b.dataset.subRemind);
    // connect to API: POST /v1/admin/forms/reminders { submissionId }
    toast(`Reminder sent to ${custById(s.clientId).name}.`);
  }));
}
