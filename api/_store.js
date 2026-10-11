// api/_store.js
// Simple in-memory store. Replace with Vercel KV / Upstash in production.
const g = globalThis;
g.__vivifyBookings ||= [];

export function addBooking(b) { g.__vivifyBookings.push(b); return b; }
export function findBookings({ date, serviceType }) {
  return g.__vivifyBookings.filter(b => b.date === date && b.serviceType === serviceType);
}
export function findByRef(ref) {
  return g.__vivifyBookings.find(b => b.ref === ref);
}
export function listBookings() { return g.__vivifyBookings; }