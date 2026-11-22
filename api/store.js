// api/store.js
const g = globalThis;
g.__vivifyBookings ||= [];

export function addBooking(b) {
  g.__vivifyBookings.push(b);
  return b;
}

export function findBookings({ date, serviceType }) {
  return g.__vivifyBookings.filter(b =>
    b.date === date &&
    b.serviceType === serviceType &&
    b.status !== "cancelled"
  );
}

export function findByRef(ref) {
  return g.__vivifyBookings.find(b => b.ref === ref);
}

export function listBookings() {
  return g.__vivifyBookings;
}

export function cancelBooking(ref) {
  const booking = findByRef(ref);
  if (booking) booking.status = "cancelled";
  return booking;
}

export function markPaid(ref, paymentRef) {
  const booking = findByRef(ref);
  if (booking) {
    booking.status = "paid";
    booking.paymentRef = paymentRef;
  }
  return booking;
}