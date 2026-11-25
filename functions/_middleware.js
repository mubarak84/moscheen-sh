/**
 * Global middleware for all Function routes: error handling + security headers.
 * Note: public/_headers only applies to static assets, so HTML produced by Functions
 * (e.g. /moscheen/:slug) gets the same headers here. Keep both in sync.
 */
const CSP =
  "default-src 'self'; script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com; " +
  "frame-src https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com; " +
  "img-src 'self' data:; style-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

export async function onRequest(context) {
  try {
    const response = await context.next();
    const res = new Response(response.body, response);
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    if ((res.headers.get('Content-Type') || '').includes('text/html')) {
      res.headers.set('Content-Security-Policy', CSP);
      res.headers.set('X-Frame-Options', 'DENY');
    }
    return res;
  } catch (err) {
    console.error('[function error]', context.request.method, new URL(context.request.url).pathname, err && err.stack);
    return new Response(JSON.stringify({ ok: false, error: 'Interner Fehler. Bitte versuchen Sie es später erneut.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
