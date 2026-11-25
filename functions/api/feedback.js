/**
 * GET  /api/feedback?mosque=slug&limit=6 – approved visitor impressions
 * POST /api/feedback                     – submit new impression (moderated, status "pending")
 */
import { cachedJson, json, error, readBody } from '../_lib/http.js';
import { getRepository } from '../_lib/repository.js';
import { validateFeedback } from '../_lib/validation.js';
import { checkSubmission } from '../_lib/security.js';
import { sendEmail } from '../_lib/email.js';
import { feedbackNotification } from '../_lib/email-templates.js';

export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const repo = getRepository(env);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '6', 10) || 6, 50);
  let mosqueId = null;
  const slug = url.searchParams.get('mosque');
  if (slug) mosqueId = (await repo.getMosque(slug))?.id ?? -1;
  return cachedJson({ ok: true, feedback: await repo.listFeedback({ mosqueId, limit }) }, 120);
}

export async function onRequestPost({ env, request }) {
  const body = await readBody(request);
  if (!body) return error(400, 'Ungültige Anfrage.');

  const blocked = await checkSubmission(request, env, body, 'feedback');
  if (blocked) return error(429, blocked);

  const v = validateFeedback(body);
  if (!v.ok) return error(422, 'Bitte prüfen Sie Ihre Eingaben.', v.errors);

  const repo = getRepository(env);
  const mosque = await repo.getMosque(v.data.mosqueSlug);
  if (!mosque) return error(422, 'Bitte prüfen Sie Ihre Eingaben.', { mosque: 'Unbekannte Moschee.' });

  await repo.createFeedback({ ...v.data, mosqueId: mosque.id });
  const mail = feedbackNotification(v.data, mosque, env.SITE_NAME);
  await sendEmail(env, { to: env.MAIL_ADMIN_TO, ...mail, replyTo: v.data.email || undefined });

  return json({
    ok: true,
    message: 'Vielen Dank für Ihr Feedback! Ihr Beitrag wird nach einer kurzen Prüfung veröffentlicht.'
  });
}
