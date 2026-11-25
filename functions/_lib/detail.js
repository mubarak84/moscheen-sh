/** Loads everything the detail page needs (used by the API and the SSR route). */
import { getRepository } from './repository.js';
import { publicMosque } from './public.js';

export async function loadMosqueDetail(env, slug) {
  if (!/^[a-z0-9-]{1,64}$/.test(slug)) return null;
  const repo = getRepository(env);
  const mosque = await repo.getMosque(slug);
  if (!mosque) return null;
  const [contacts, events, highlights, feedback] = await Promise.all([
    repo.listContacts(mosque.id),
    repo.listEvents({ mosqueId: mosque.id, limit: 4 }),
    repo.listHighlights({ mosqueId: mosque.id, limit: 3 }),
    repo.listFeedback({ mosqueId: mosque.id, limit: 12 })
  ]);
  return { mosque: publicMosque(mosque), contacts, events, highlights, feedback };
}
