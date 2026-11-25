/**
 * Cloudflare Worker entry point (Workers + Static Assets).
 *
 * Static files in public/ are served directly by Cloudflare. Only paths listed in
 * wrangler.toml → assets.run_worker_first (/api/*, /moscheen/*, /media/*) reach this Worker.
 *
 * Route handlers live in functions/ and use the Pages-Functions signature
 * (export onRequestGet/onRequestPost/…(context)). This file is a tiny router that builds the
 * same `context` object ({ request, env, params, data, waitUntil, next }) and runs middlewares,
 * so the handlers stay simple and framework-free.
 *
 * To add a route: create the handler file in functions/ and register it in ROUTES below.
 */
import * as rootMiddleware from '../functions/_middleware.js';
import * as adminMiddleware from '../functions/api/admin/_middleware.js';

import * as apiConfig from '../functions/api/config.js';
import * as apiMosques from '../functions/api/mosques/index.js';
import * as apiMosque from '../functions/api/mosques/[slug].js';
import * as apiEvents from '../functions/api/events.js';
import * as apiHighlights from '../functions/api/highlights.js';
import * as apiFeedback from '../functions/api/feedback.js';
import * as apiBookings from '../functions/api/bookings.js';
import * as apiContact from '../functions/api/contact.js';
import * as adminBookings from '../functions/api/admin/bookings.js';
import * as adminFeedback from '../functions/api/admin/feedback.js';
import * as mosquePage from '../functions/moscheen/[slug].js';
import * as media from '../functions/media/[[path]].js';

/** [pattern, handler module, extra middlewares]. Named groups become context.params. */
const ROUTES = [
  [/^\/api\/config\/?$/, apiConfig],
  [/^\/api\/mosques\/?$/, apiMosques],
  [/^\/api\/mosques\/(?<slug>[^/]+)\/?$/, apiMosque],
  [/^\/api\/events\/?$/, apiEvents],
  [/^\/api\/highlights\/?$/, apiHighlights],
  [/^\/api\/feedback\/?$/, apiFeedback],
  [/^\/api\/bookings\/?$/, apiBookings],
  [/^\/api\/contact\/?$/, apiContact],
  [/^\/api\/admin\/bookings\/?$/, adminBookings, [adminMiddleware]],
  [/^\/api\/admin\/feedback\/?$/, adminFeedback, [adminMiddleware]],
  [/^\/moscheen\/(?<slug>[^/]+)\/?$/, mosquePage],
  [/^\/media\/(?<path>.+)$/, media]
];

const METHOD_EXPORT = {
  GET: 'onRequestGet', HEAD: 'onRequestGet', POST: 'onRequestPost', PUT: 'onRequestPut',
  PATCH: 'onRequestPatch', DELETE: 'onRequestDelete', OPTIONS: 'onRequestOptions'
};

function jsonResponse(status, error) {
  return new Response(JSON.stringify({ ok: false, error }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

function match(pathname) {
  for (const [pattern, module, middlewares = []] of ROUTES) {
    const m = pathname.match(pattern);
    if (!m) continue;
    const params = { ...(m.groups || {}) };
    if (params.path) params.path = params.path.split('/').map(decodeURIComponent); // [[path]] = array
    if (params.slug) params.slug = decodeURIComponent(params.slug);
    return { module, middlewares, params };
  }
  return null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const route = match(url.pathname);

    // Not a dynamic route → static asset (also applies _redirects / 404 page).
    let handler;
    if (route) {
      const fn = route.module[METHOD_EXPORT[request.method]] || route.module.onRequest;
      handler = fn || (() => jsonResponse(405, 'Methode nicht erlaubt.'));
    } else if (url.pathname.startsWith('/api/')) {
      handler = () => jsonResponse(404, 'Nicht gefunden.');
    } else {
      handler = () => env.ASSETS.fetch(request);
    }

    // Middleware chain: root → route-specific → handler (Pages-Functions semantics).
    const chain = [rootMiddleware.onRequest, ...(route?.middlewares || []).map((m) => m.onRequest), handler];
    const context = {
      request,
      env,
      params: route?.params || {},
      data: {},
      waitUntil: (p) => ctx.waitUntil(p),
      next: undefined
    };
    let i = 0;
    context.next = async () => chain[i++](context);
    return context.next();
  }
};
