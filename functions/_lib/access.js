/**
 * Cloudflare Access JWT verification for the (future) admin backend.
 * https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/
 *
 * Requires vars ACCESS_TEAM_DOMAIN (e.g. "myteam.cloudflareaccess.com") and ACCESS_AUD
 * (Application Audience tag). Protect the paths /admin* and /api/admin* with an Access
 * application in the Zero Trust dashboard.
 */

let jwksCache = { keys: null, fetchedAt: 0 };

function b64urlToBytes(s) {
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : '';
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function getKeys(teamDomain) {
  if (jwksCache.keys && Date.now() - jwksCache.fetchedAt < 3600_000) return jwksCache.keys;
  const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error('Could not load Access certs');
  const { keys } = await res.json();
  jwksCache = { keys, fetchedAt: Date.now() };
  return keys;
}

/** @returns {Promise<{email:string}|null>} identity or null if not authorised */
export async function verifyAccess(request, env) {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return null;
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return null;

  const [h, p, sig] = token.split('.');
  if (!h || !p || !sig) return null;
  try {
    const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(h)));
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(p)));
    const jwk = (await getKeys(env.ACCESS_TEAM_DOMAIN)).find((k) => k.kid === header.kid);
    if (!jwk || header.alg !== 'RS256') return null;

    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlToBytes(sig), new TextEncoder().encode(`${h}.${p}`));
    if (!valid) return null;

    const aud = [].concat(payload.aud);
    const now = Math.floor(Date.now() / 1000);
    if (!aud.includes(env.ACCESS_AUD) || payload.exp < now || payload.iss !== `https://${env.ACCESS_TEAM_DOMAIN}`) return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}
