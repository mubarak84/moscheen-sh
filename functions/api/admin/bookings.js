/**
 * Phase 3 – admin: list visit requests.
 * GET /api/admin/bookings?status=new
 * (Extend with PATCH for status changes: new → confirmed | declined | done.)
 */
import { json } from '../../_lib/http.js';

export async function onRequestGet({ env, request }) {
  const status = new URL(request.url).searchParams.get('status');
  const { results } = await env.DB
    .prepare(
      `SELECT b.*, m.name AS mosque_name FROM bookings b JOIN mosques m ON m.id = b.mosque_id
       WHERE (?1 IS NULL OR b.status = ?1) ORDER BY b.created_at DESC LIMIT 200`
    )
    .bind(status)
    .all();
  return json({ ok: true, bookings: results });
}
