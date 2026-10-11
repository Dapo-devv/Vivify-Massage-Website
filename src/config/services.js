// ─────────────────────────────────────────────────────────────
// Vivify — single source of truth for services, pricing, addons
// ─────────────────────────────────────────────────────────────

export const PRICING = {
  studio: {
    swedish: { 60: 25000, 90: 35000, 120: 50000 },
    "deep-tissue": { 60: 30000, 90: 40000, 120: 50000 },
    "full-body": { 60: 30000, 90: 40000, 120: 50000 },
    sports: { 60: 50000, 90: 70000 },
  },
  mobile: {
    swedish: { 60: 35000, 90: 50000, 120: 65000 },
    "deep-tissue": { 60: 40000, 90: 55000, 120: 70000 },
    "full-body": { 60: 40000, 90: 55000, 120: 70000 },
    sports: { 60: 70000, 90: 95000 },
  },
};

export const SERVICES = [
  {
    id: "swedish",
    name: "Swedish Massage",
    icon: "🌿",
    desc: "Gentle, flowing strokes for circulation and calm.",
    benefit: "Deep relaxation, stress management and unwinding.",
    badge: "Popular",
    bc: "bg-emerald-100 text-emerald-700",
    image: "/assets/swedish_massage.jpg",
  },
  {
    id: "deep-tissue",
    name: "Deep Tissue Massage",
    icon: "💪",
    desc: "Targeted pressure to release chronic tension.",
    benefit: "Recovery, relief from body pain, muscle tension and aches.",
    badge: "Therapeutic",
    bc: "bg-amber-100 text-amber-700",
    image: "/assets/deep_tissue.jpg",
  },
  {
    id: "full-body",
    name: "Full Body Massage",
    icon: "✨",
    desc: "Head-to-toe treatment combining multiple techniques.",
    benefit:
      "Tailored massage — a custom combination of Swedish and Deep Tissue techniques.",
    badge: "Signature",
    bc: "bg-violet-100 text-violet-700",
    image: "/assets/engin_akyurt-massage-7452918_1920.jpg",
  },
];

export const ADDONS = [
  {
    id: "scalp",
    name: "Scalp Massage",
    icon: "💆",
    price: 4000,
    minutes: 15,
    desc: "Pressure-point scalp and temple work",
  },
  {
    id: "reflexology",
    name: "Foot Reflexology",
    icon: "👣",
    price: 5000,
    minutes: 20,
    desc: "Zone-based foot therapy",
  },
];

export const THERAPISTS = [
  {
    id: "any",
    name: "No Preference",
    role: "Next available",
    gender: "any",
    rating: 5.0,
    specialties: ["All services"],
  },
  {
    id: "female",
    name: "Female Therapist",
    role: "Certified & vetted",
    gender: "female",
    rating: 4.9,
    specialties: ["Swedish", "Deep Tissue", "Full Body"],
  },
  {
    id: "male",
    name: "Male Therapist",
    role: "Certified & vetted",
    gender: "male",
    rating: 4.9,
    specialties: ["Swedish", "Deep Tissue", "Full Body", "Sports"],
  },
];

// ─────────────────────────────────────────────────────────────
// Sports Massage therapists.
//
// Add a new therapist by appending to this array — the info card
// in SportsMassage.jsx reads from here and updates its copy
// automatically. Flip `available: false` to hide someone without
// deleting them.
// ─────────────────────────────────────────────────────────────
export const SPORTS_THERAPISTS = [
  {
    id: "male-specialist",
    name: "Male Specialist",
    gender: "male",
    role: "Certified Sports & Recovery Therapist",
    available: true,
  },
  // ── Future: uncomment + edit when you add a female sports therapist ──
  // {
  //   id: "female-specialist",
  //   name: "Female Specialist",
  //   gender: "female",
  //   role: "Certified Sports & Recovery Therapist",
  //   available: true,
  // },
];

export const STUDIO_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];

export const MOBILE_SLOTS = [
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
  "11:00 PM",
  "12:00 AM",
];

export const MEM_PLANS = [
  {
    id: "relaxation",
    label: "Relaxation Duo",
    sessions: 2,
    icon: "🌿",
    tag: "Self-Care",
    desc: "Two soothing sessions per month — Swedish, Deep Tissue, or Full Body.",
  },
  {
    id: "pro-athlete",
    label: "Pro / Athlete Recovery",
    sessions: 2,
    icon: "⚡",
    tag: "Performance",
    desc: "Two targeted recovery sessions per month for athletes and busy professionals.",
  },
];

export const SPORTS_TECHNIQUES = [
  {
    id: "met",
    name: "MET Stretching",
    fullName: "Muscle Energy Technique",
    blurb:
      "Gentle muscle contractions to relax, lengthen and rebalance your body.",
    icon: "🔄",
  },
  {
    id: "pnf",
    name: "PNF Stretching",
    fullName: "Proprioceptive Neuromuscular Facilitation",
    blurb:
      "Contract-relax method for improving flexibility and peak performance.",
    icon: "⚡",
  },
];

export const SPORTS_DURATIONS = [60, 90];

export const SPORTS_FOCUS = [
  "Neck & Shoulders",
  "Lower Back",
  "Hamstrings",
  "Calves",
  "IT Band",
  "Glutes",
  "Quads",
  "Full Body",
];

// Helpers
export const fmt = (n) => `₦${Number(n).toLocaleString()}`;
export const disc10 = (n) => Math.round(n * 0.9);
export const getPrice = (type, svc, dur) => PRICING[type]?.[svc]?.[dur] || 0;
export const durList = (svc) =>
  svc ? Object.keys(PRICING.studio[svc] || {}).map(Number) : [60, 90, 120];
export const todayStr = () => new Date().toISOString().split("T")[0];
export const maxStr = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().split("T")[0];
};

// ─────────────────────────────────────────────────────────────
// Location labels — single source of truth so we never miss one
// ─────────────────────────────────────────────────────────────
export const LOCATION_LABEL = {
  studio: "Our Home Studio",
  mobile: "Your Home or Hotel",
};

// ─────────────────────────────────────────────────────────────
// Sports therapist copy helper — derives the info card text
// from the SPORTS_THERAPISTS array. Add a female → copy updates.
// ─────────────────────────────────────────────────────────────
export const getSportsTherapistInfo = () => {
  const available = SPORTS_THERAPISTS.filter((t) => t.available);
  const hasMale = available.some((t) => t.gender === "male");
  const hasFemale = available.some((t) => t.gender === "female");

  let headline = "";
  let detail = "";

  if (hasMale && hasFemale) {
    headline = "Male & Female Specialists Available";
    detail =
      "Both specialists are certified in Sports Massage. Your therapist will be confirmed when we reach out on WhatsApp.";
  } else if (hasMale) {
    headline = "Performed by our Male Specialist";
    detail =
      "Sports Massage is currently delivered by our certified male specialist. You'll meet him at your session.";
  } else if (hasFemale) {
    headline = "Performed by our Female Specialist";
    detail =
      "Sports Massage is currently delivered by our certified female specialist. You'll meet her at your session.";
  } else {
    headline = "Therapist Assignment Confirmed on Booking";
    detail =
      "We'll assign a certified specialist and confirm their details when we reach out on WhatsApp.";
  }

  return {
    available,
    hasMale,
    hasFemale,
    headline,
    detail,
    list: available.map((t) => ({
      name: t.name,
      role: t.role,
      gender: t.gender,
    })),
  };
};
