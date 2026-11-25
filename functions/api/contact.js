/** POST /api/contact – general contact form. */
import { json, error, readBody } from '../_lib/http.js';
import { getRepository } from '../_lib/repository.js';
import { validateContact } from '../_lib/validation.js';
import { checkSubmission } from '../_lib/security.js';
import { sendEmail } from '../_lib/email.js';
import { contactConfirmation, contactNotification } from '../_lib/email-templates.js';

export async function onRequestPost({ env, request, waitUntil }) {
  const body = await readBody(request);
  if (!body) return error(400, 'Ungültige Anfrage.');

  const blocked = await checkSubmission(request, env, body, 'contact');
  if (blocked) return error(429, blocked);

  const v = validateContact(body);
  if (!v.ok) return error(422, 'Bitte prüfen Sie Ihre Eingaben.', v.errors);

  const repo = getRepository(env);
  const mosque = v.data.mosqueSlug ? await repo.getMosque(v.data.mosqueSlug) : null;
  const saved = await repo.createContactMessage({ ...v.data, mosqueId: mosque?.id });

  const to = mosque?.bookingEmail || env.MAIL_ADMIN_TO;
  const sent = await sendEmail(env, { to, ...contactNotification(v.data, mosque, env.SITE_NAME), replyTo: v.data.email });
  if (!sent.ok && !saved.stored) {
    return error(502, 'Ihre Nachricht konnte leider nicht gesendet werden. Bitte versuchen Sie es später erneut.');
  }
  waitUntil(sendEmail(env, { to: v.data.email, ...contactConfirmation(v.data, env.SITE_NAME) }));

  return json({ ok: true, message: 'Vielen Dank für Ihre Nachricht! Wir melden uns in der Regel innerhalb von 72 Stunden.' });
}
