/** GET /api/mosques – list of all published mosques/centres. */
import { cachedJson } from '../../_lib/http.js';
import { getRepository } from '../../_lib/repository.js';
import { publicMosque } from '../../_lib/public.js';

export async function onRequestGet({ env }) {
  const mosques = await getRepository(env).listMosques();
  return cachedJson({ ok: true, mosques: mosques.map(publicMosque) });
}
