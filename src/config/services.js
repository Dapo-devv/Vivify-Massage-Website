export const LOCATION_LABEL = {
  studio: "Our Home Studio",
  mobile: "Your Home or Hotel",
};

export const SERVICES = [
  {
    id: "swedish",
    name: "Swedish Massage",
    icon: "🌸",
    badge: "Classic",
    bc: "bg-teal-50 text-teal-700",
    benefit: "Gentle, flowing strokes to ease tension and promote total relaxation.",
  },
  {
    id: "deep_tissue",
    name: "Deep Tissue",
    icon: "💪",
    badge: "Therapeutic",
    bc: "bg-orange-50 text-orange-700",
    benefit: "Firm pressure targeting deep muscle layers and chronic knots.",
  },
  {
    id: "hot_stone",
    name: "Hot Stone",
    icon: "🔥",
    badge: "Luxury",
    bc: "bg-red-50 text-red-700",
    benefit: "Smooth heated stones melt away stress and deeply relax muscles.",
  },
  {
    id: "feet",
    name: "Reflexology (Feet)",
    icon: "🦶",
    badge: "Grounding",
    bc: "bg-amber-50 text-amber-700",
    benefit: "Targeted pressure points on the feet to restore balance and energy.",
  },
  {
    id: "scalp",
    name: "Scalp Therapy",
    icon: "🧠",
    badge: "Soothing",
    bc: "bg-indigo-50 text-indigo-700",
    benefit: "Relieves headaches and promotes deep mental relaxation.",
  },
  {
    id: "aromatherapy",
    name: "Aromatherapy",
    icon: "🌿",
    badge: "Sensory",
    bc: "bg-emerald-50 text-emerald-700",
    benefit: "Essential oils tailored to your mood, enhancing physical and emotional well-being.",
  },
];

export const ADDONS = [
  { id: "hot_towels", name: "Hot Towels", icon: "♨️", price: 2000, minutes: 5, desc: "Warm towels to open pores and relax muscles." },
  { id: "scalp_scrub", name: "Scalp Scrub", icon: "✨", price: 3500, minutes: 10, desc: "Exfoliating scalp treatment for ultimate refreshment." },
  { id: "foot_scrub", name: "Foot Scrub", icon: "🦶", price: 3000, minutes: 10, desc: "Revitalizing scrub to soften and smooth tired feet." },
];

export const THERAPISTS = [
  { id: "any", name: "Any Available", role: "We will assign the best specialist for you." },
  { id: "female", name: "Female Specialist", role: "Expert in relaxation and deep tissue therapy." },
  { id: "male", name: "Male Specialist", role: "Expert in sports and deep tissue recovery." },
];

export const MEMBERSHIP_PLAN = {
  name: "Vivify Wellness Club",
  tagline: "Consistent self-care, exclusive pricing.",
  icon: "👑",
  sessions: "Monthly",
  benefits: [
    { icon: "✨", text: "Priority booking for your preferred times." },
    { icon: "💆", text: "Dedicated specialist who knows your body." },
    { icon: "💎", text: "Complimentary aromatherapy upgrade." },
  ],
};

// PRICING LOGIC
// Map of service IDs to their base price (e.g., for 60 mins)
const BASE_PRICES = {
  swedish: 15000,
  deep_tissue: 20000,
  hot_stone: 25000,
  feet: 6000,
  scalp: 10000,
  aromatherapy: 18000,
};

export const getPrice = (svcType, serviceId, duration) => {
  if (!serviceId || !duration) return 0;
  let base = BASE_PRICES[serviceId] || 15000;

  // Adjust price based on duration (e.g., 90 mins is 1.5x, 120 mins is 2x)
  const multiplier = Number(duration) / 60;
  let price = base * multiplier;

  // Mobile service adds a slight surcharge (e.g., 15%) for transport
  if (svcType === "mobile") {
    price = price * 1.15;
  }

  return Math.round(price);
};

export const durList = (serviceId) => {
  // Feet and scalp might only have 60 mins, others have 60, 90, 120
  if (serviceId === "feet" || serviceId === "scalp") return [60, 90];
  return [60, 90, 120];
};

export const fmt = (n) => `₦${Number(n).toLocaleString()}`;