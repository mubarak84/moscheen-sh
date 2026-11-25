/** GET /api/config – public runtime config for the frontend. */
import { json } from '../_lib/http.js';

export const onRequestGet = ({ env }) =>
  json(
    { turnstileSiteKey: env.TURNSTILE_SITE_KEY || null, siteName: env.SITE_NAME || '' },
    { headers: { 'Cache-Control': 'public, max-age=300' } }
  );
