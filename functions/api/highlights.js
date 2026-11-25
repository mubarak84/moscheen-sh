/** GET /api/highlights?limit=6 – recent programme highlights. */
import { cachedJson } from '../_lib/http.js';
import { getRepository } from '../_lib/repository.js';

export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '6', 10) || 6, 24);
  return cachedJson({ ok: true, highlights: await getRepository(env).listHighlights({ limit }) });
}
