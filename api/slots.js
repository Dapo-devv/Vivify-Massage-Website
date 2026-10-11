// api/slots.js — GET /api/slots?date=YYYY-MM-DD&serviceType=studio&minutes=90
import { findBookings } from "./_store.js";
import { STUDIO_SLOTS, MOBILE_SLOTS, CLOSE_HOUR } from "./_constants.js";

function to24(t) {
  const [time, ap] = t.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

export default function handler(req, res) {
  const { date, serviceType = "studio", minutes = 60 } = req.query || {};

  if (!date) {
    return res.status(400).json({ error: "date required" });
  }
  if (serviceType !== "studio" && serviceType !== "mobile") {
    return res.status(400).json({ error: "invalid serviceType" });
  }

  const slots = serviceType === "mobile" ? MOBILE_SLOTS : STUDIO_SLOTS;
  const closeAt = CLOSE_HOUR[serviceType] * 60;
  const existing = findBookings({ date, serviceType });
  const taken = new Set(existing.map((b) => b.time));

  const available = slots.filter((s) => {
    if (taken.has(s)) return false;
    const start = to24(s);
    return start + Number(minutes) <= closeAt;
  });

  return res.json({
    date,
    serviceType,
    minutes: Number(minutes),
    available,
    taken: [...taken],
  });
}
