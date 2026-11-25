/**
 * Phase 2 – serves images from the R2 bucket (binding MEDIA) at /media/<key>.
 * Example: /media/mosques/kiel/hero.jpg  →  R2 object "mosques/kiel/hero.jpg"
 */
export async function onRequestGet({ env, params }) {
  if (!env.MEDIA) return new Response('Not found', { status: 404 });
  const key = [].concat(params.path || []).join('/');
  if (!key || key.includes('..')) return new Response('Not found', { status: 404 });

  const object = await env.MEDIA.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('ETag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
  return new Response(object.body, { headers });
}
