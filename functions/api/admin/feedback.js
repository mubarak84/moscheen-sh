/**
 * Phase 3 – admin: moderate visitor feedback.
 * GET   /api/admin/feedback?status=pending
 * PATCH /api/admin/feedback   body: { id, status: "approved" | "rejected" }
 */
import { json, error, readBody } from '../../_lib/http.js';

export async function onRequestGet({ env, request }) {
  const status = new URL(request.url).searchParams.get('status') || 'pending';
  const { results } = await env.DB
    .prepare('SELECT * FROM feedback WHERE status = ?1 ORDER BY created_at DESC LIMIT 200')
    .bind(status)
    .all();
  return json({ ok: true, feedback: results });
}

export async function onRequestPatch({ env, request, data }) {
  const body = await readBody(request);
  const id = parseInt(body?.id, 10);
  if (!id || !['approved', 'rejected'].includes(body?.status)) return error(422, 'Ungültige Eingabe.');
  await env.DB
    .prepare('UPDATE feedback SET status = ?1, moderated_by = ?2, moderated_at = ?3 WHERE id = ?4')
    .bind(body.status, data.user.email, new Date().toISOString(), id)
    .run();
  return json({ ok: true });
}
