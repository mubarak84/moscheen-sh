/** GET /api/events?mosque=slug&limit=6 – upcoming events. */
import { cachedJson } from '../_lib/http.js';
import { getRepository } from '../_lib/repository.js';

export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const repo = getRepository(env);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '6', 10) || 6, 24);
  let mosqueId = null;
  const slug = url.searchParams.get('mosque');
  if (slug) mosqueId = (await repo.getMosque(slug))?.id ?? -1;
  return cachedJson({ ok: true, events: await repo.listEvents({ mosqueId, limit }) });
}
