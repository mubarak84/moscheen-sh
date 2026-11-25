/** Spam protection for form endpoints: honeypot, Cloudflare Turnstile, optional KV rate limit. */

const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Runs all checks. Returns null when OK, otherwise a German error message.
 * @param {Request} request
 * @param {object} env
 * @param {object} body  parsed body (expects `website` honeypot + `cf-turnstile-response`)
 * @param {string} scope rate-limit bucket name, e.g. "booking"
 */
export async function checkSubmission(request, env, body, scope) {
  // 1. Honeypot – real users never fill the hidden "website" field.
  if (body.website) return 'Anfrage konnte nicht verarbeitet werden.';

  const ip = request.headers.get('CF-Connecting-IP') || '';

  // 2. Rate limit (only if KV namespace RATE_LIMIT is bound): max 5 per 10 minutes per IP & scope.
  if (env.RATE_LIMIT && ip) {
    const key = `rl:${scope}:${ip}`;
    const count = parseInt((await env.RATE_LIMIT.get(key)) || '0', 10);
    if (count >= 5) return 'Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut.';
    await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: 600 });
  }

  // 3. Turnstile (only if secret configured).
  if (env.TURNSTILE_SECRET_KEY) {
    const token = body['cf-turnstile-response'];
    if (!token) return 'Bitte bestätigen Sie, dass Sie kein Roboter sind.';
    const form = new FormData();
    form.append('secret', env.TURNSTILE_SECRET_KEY);
    form.append('response', String(token));
    if (ip) form.append('remoteip', ip);
    const res = await fetch(TURNSTILE_VERIFY, { method: 'POST', body: form });
    const outcome = await res.json().catch(() => ({ success: false }));
    if (!outcome.success) return 'Die Sicherheitsprüfung ist fehlgeschlagen. Bitte laden Sie die Seite neu.';
  }
  return null;
}
