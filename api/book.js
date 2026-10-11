// api/book.js — POST
import { addBooking } from "./_store.js";

function makeRef() {
  const d = new Date();
  return `VMS-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export default function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  const b = req.body || {};
  const ref = makeRef();
  const booking = {
    ref,
    createdAt: new Date().toISOString(),
    status: "pending_payment",
    ...b,
  };
  addBooking(booking);
  return res.json({ success: true, ref });
}
