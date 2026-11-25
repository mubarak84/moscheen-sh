/** GET /api/mosques/:slug – mosque detail incl. contacts, events, highlights, feedback. */
import { cachedJson, error } from '../../_lib/http.js';
import { loadMosqueDetail } from '../../_lib/detail.js';

export async function onRequestGet({ env, params }) {
  const detail = await loadMosqueDetail(env, String(params.slug));
  if (!detail) return error(404, 'Moschee nicht gefunden.');
  return cachedJson({ ok: true, ...detail });
}
