/**
 * Guard for the future admin backend (phase 3).
 * Every /api/admin/* request needs a valid Cloudflare Access JWT.
 * Until ACCESS_TEAM_DOMAIN and ACCESS_AUD are configured, all admin routes return 404.
 */
import { verifyAccess } from '../../_lib/access.js';
import { error } from '../../_lib/http.js';

export async function onRequest(context) {
  const { env, request } = context;
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return error(404, 'Nicht gefunden.');
  const user = await verifyAccess(request, env);
  if (!user) return error(401, 'Nicht autorisiert.');
  if (!env.DB) return error(503, 'Datenbank ist noch nicht angebunden.');
  context.data.user = user;
  return context.next();
}
