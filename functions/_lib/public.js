/** Shapes data for public API output (removes internal fields). */
export function publicMosque(m) {
  if (!m) return null;
  const { bookingEmail, sortOrder, ...rest } = m;
  return rest;
}
