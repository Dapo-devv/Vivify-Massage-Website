// api/book.js — POST
import { addBooking, findBookings, cancelBooking, markPaid } from "./store.js";

function makeRef() {
  const d = new Date();
  return `VMS-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const b = req.body || {};

  // Handle cancelling a pending payment
  if (b.action === "cancel") {
    cancelBooking(b.ref);
    return res.json({ success: true, message: "Cancelled" });
  }

  // Handle marking a booking as paid after Paystack succeeds
  if (b.action === "mark_paid") {
    markPaid(b.ref, b.paymentRef);
    return res.json({ success: true, message: "Marked as paid" });
  }

  // Default booking flow
  const ref = makeRef();

  // Prevent double booking race conditions
  if (b.date && b.time && b.serviceType) {
    const existing = findBookings({ date: b.date, serviceType: b.serviceType });
    const isTaken = existing.some(book => book.time === b.time);
    if (isTaken) {
      return res.status(409).json({ error: "This time slot has just been booked. Please select another." });
    }
  }

  const booking = {
    ref,
    createdAt: new Date().toISOString(),
    status: "pending_payment",
    ...b,
  };

  addBooking(booking);
  return res.json({ success: true, ref });
}