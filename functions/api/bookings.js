/**
 * POST /api/bookings – visit request ("Besuch anfragen").
 * 1. spam checks  2. validation  3. store in D1 (if bound)
 * 4. notify mosque/admin  5. auto-reply to visitor ("Antwort innerhalb von 72 Stunden")
 */
import { json, error, readBody } from '../_lib/http.js';
import { getRepository } from '../_lib/repository.js';
import { validateBooking, makeReference } from '../_lib/validation.js';
import { checkSubmission } from '../_lib/security.js';
import { sendEmail } from '../_lib/email.js';
import { bookingConfirmation, bookingNotification } from '../_lib/email-templates.js';

export async function onRequestPost({ env, request, waitUntil }) {
  const body = await readBody(request);
  if (!body) return error(400, 'Ungültige Anfrage.');

  const blocked = await checkSubmission(request, env, body, 'booking');
  if (blocked) return error(429, blocked);

  const v = validateBooking(body);
  if (!v.ok) return error(422, 'Bitte prüfen Sie Ihre Eingaben.', v.errors);

  const repo = getRepository(env);
  const mosque = await repo.getMosque(v.data.mosqueSlug);
  if (!mosque) return error(422, 'Bitte prüfen Sie Ihre Eingaben.', { mosque: 'Unbekannte Moschee.' });

  const booking = { ...v.data, mosqueId: mosque.id, reference: makeReference(mosque.slug) };
  const saved = await repo.createBooking(booking);

  const staffTo = mosque.bookingEmail || env.MAIL_ADMIN_TO;
  const staff = bookingNotification(booking, mosque, env.SITE_NAME);
  const visitor = bookingConfirmation(booking, mosque, env.SITE_NAME);

  // Without a database the staff email is the only record → it must succeed.
  const sent = await sendEmail(env, { to: staffTo, ...staff, replyTo: booking.email });
  if (!sent.ok && !saved.stored) {
    return error(502, 'Ihre Anfrage konnte leider nicht gesendet werden. Bitte versuchen Sie es später erneut.');
  }

  // Auto-reply in the background – does not delay the response.
  waitUntil(sendEmail(env, { to: booking.email, ...visitor, replyTo: staffTo }));

  return json({
    ok: true,
    reference: booking.reference,
    message:
      'Vielen Dank für Ihre Anfrage! Ihr Terminvorschlag wird geprüft. Wir melden uns innerhalb von 72 Stunden bei Ihnen. Eine Bestätigung haben wir an Ihre E-Mail-Adresse gesendet.'
  });
}
