/** Server-side validation. Server is authoritative – never trust the client. */

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const VISIT_TYPES = {
  individual: 'Einzelbesuch / Familie',
  group: 'Gruppenbesuch',
  school: 'Schulklasse / Kita',
  organization: 'Verein, Kirchengemeinde oder Institution',
  press: 'Presse / Medien'
};

export const INTERESTS = {
  tour: 'Führung durch die Moschee',
  prayer: 'Beim Gebet zuschauen',
  talk: 'Gespräch / Vortrag über den Islam',
  qa: 'Fragen & Antworten',
  tea: 'Tee & Begegnung'
};

export const LANGUAGES = { de: 'Deutsch', en: 'Englisch', ur: 'Urdu', ar: 'Arabisch' };

export function str(v, max = 500) {
  if (v == null) return '';
  return String(Array.isArray(v) ? v[0] : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

export function isEmail(v) { return EMAIL_RE.test(v) && v.length <= 254; }

function isFutureDate(d) {
  if (!DATE_RE.test(d)) return false;
  const today = new Date().toISOString().slice(0, 10);
  const max = new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10);
  return d >= today && d <= max;
}

function consentGiven(v) { return v === true || v === 'true' || v === 'on' || v === '1'; }

/** @returns {{ ok: true, data } | { ok: false, errors: Record<string,string> }} */
export function validateBooking(body) {
  const errors = {};
  const data = {
    mosqueSlug: str(body.mosque, 64),
    visitType: str(body.visitType, 32),
    groupSize: parseInt(str(body.groupSize, 4), 10) || 1,
    organization: str(body.organization, 200),
    language: str(body.language, 8) || 'de',
    name: str(body.name, 120),
    email: str(body.email, 254).toLowerCase(),
    phone: str(body.phone, 40),
    message: str(body.message, 2000),
    interests: [].concat(body.interests || []).map((i) => str(i, 16)).filter((i) => i in INTERESTS),
    slots: []
  };

  if (!data.mosqueSlug) errors.mosque = 'Bitte wählen Sie eine Moschee.';
  if (!(data.visitType in VISIT_TYPES)) errors.visitType = 'Bitte wählen Sie die Art des Besuchs.';
  if (data.visitType !== 'individual' && (data.groupSize < 2 || data.groupSize > 200)) {
    errors.groupSize = 'Bitte geben Sie eine Gruppengröße zwischen 2 und 200 an.';
  }
  if (data.visitType === 'individual') data.groupSize = Math.min(Math.max(data.groupSize, 1), 10);
  if (!(data.language in LANGUAGES)) data.language = 'de';
  if (data.name.length < 2) errors.name = 'Bitte geben Sie Ihren Namen an.';
  if (!isEmail(data.email)) errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.';
  if (data.phone && !/^[+\d\s()/-]{5,40}$/.test(data.phone)) errors.phone = 'Bitte prüfen Sie die Telefonnummer.';

  const rawSlots = Array.isArray(body.slots) ? body.slots : [];
  for (const s of rawSlots.slice(0, 3)) {
    const date = str(s && s.date, 10);
    const time = str(s && s.time, 5);
    if (!date && !time) continue;
    if (!isFutureDate(date) || !TIME_RE.test(time)) {
      errors.slots = 'Bitte wählen Sie gültige Wunschtermine (Datum ab heute, Uhrzeit).';
      break;
    }
    data.slots.push({ date, time });
  }
  if (!data.slots.length && !errors.slots) errors.slots = 'Bitte geben Sie mindestens einen Wunschtermin an.';
  if (!consentGiven(body.privacy)) errors.privacy = 'Bitte stimmen Sie der Datenschutzerklärung zu.';

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

export function validateContact(body) {
  const errors = {};
  const data = {
    mosqueSlug: str(body.mosque, 64),
    name: str(body.name, 120),
    email: str(body.email, 254).toLowerCase(),
    subject: str(body.subject, 150) || 'Allgemeine Anfrage',
    message: str(body.message, 4000)
  };
  if (data.name.length < 2) errors.name = 'Bitte geben Sie Ihren Namen an.';
  if (!isEmail(data.email)) errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.';
  if (data.message.length < 10) errors.message = 'Bitte schreiben Sie uns eine Nachricht (mind. 10 Zeichen).';
  if (!consentGiven(body.privacy)) errors.privacy = 'Bitte stimmen Sie der Datenschutzerklärung zu.';
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

export function validateFeedback(body) {
  const errors = {};
  const data = {
    mosqueSlug: str(body.mosque, 64),
    name: str(body.name, 80),
    email: str(body.email, 254).toLowerCase(),
    visitType: str(body.visitType, 32) || 'individual',
    rating: parseInt(str(body.rating, 1), 10),
    text: str(body.text, 1500),
    visitedOn: str(body.visitedOn, 10)
  };
  if (!data.mosqueSlug) errors.mosque = 'Bitte wählen Sie eine Moschee.';
  if (data.name.length < 2) errors.name = 'Bitte geben Sie einen Namen an (z. B. Vorname + Initial).';
  if (data.email && !isEmail(data.email)) errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.';
  if (!(data.visitType in VISIT_TYPES)) data.visitType = 'individual';
  if (!(data.rating >= 1 && data.rating <= 5)) errors.rating = 'Bitte vergeben Sie 1 bis 5 Sterne.';
  if (data.text.length < 20) errors.text = 'Bitte beschreiben Sie Ihren Eindruck (mind. 20 Zeichen).';
  if (data.visitedOn && !DATE_RE.test(data.visitedOn)) data.visitedOn = '';
  if (!consentGiven(body.privacy)) errors.privacy = 'Bitte stimmen Sie der Veröffentlichung und der Datenschutzerklärung zu.';
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

/** Human-readable booking reference, e.g. "SH-KIE-7Q4M2". */
export function makeReference(slug) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  const code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  return `SH-${slug.slice(0, 3).toUpperCase()}-${code}`;
}
