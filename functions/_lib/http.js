/** Small response helpers for the route handlers in functions/. */

export function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), { ...init, headers });
}

/** Public, cacheable JSON (edge + browser) for read endpoints. */
export function cachedJson(data, seconds = 300) {
  return json(data, { headers: { 'Cache-Control': `public, max-age=60, s-maxage=${seconds}` } });
}

export function error(status, message, details) {
  return json({ ok: false, error: message, ...(details ? { details } : {}) }, { status });
}

/** Parse JSON or form-encoded bodies. Returns null on invalid input. */
export async function readBody(request) {
  const type = request.headers.get('Content-Type') || '';
  try {
    if (type.includes('application/json')) return await request.json();
    if (type.includes('form')) {
      const fd = await request.formData();
      const obj = {};
      for (const [k, v] of fd.entries()) {
        if (k in obj) obj[k] = [].concat(obj[k], v);
        else obj[k] = v;
      }
      return obj;
    }
  } catch {
    return null;
  }
  return null;
}
