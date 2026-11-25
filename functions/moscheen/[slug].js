/**
 * GET /moscheen/:slug – mosque detail page.
 * Serves the static template public/moschee.html and uses HTMLRewriter to inject
 * SEO meta tags (title, description, Open Graph) and the page data as inline JSON,
 * so the page renders without an extra API round-trip and search engines see real content.
 */
import { loadMosqueDetail } from '../_lib/detail.js';

const escAttr = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export async function onRequestGet({ env, params, request }) {
  const detail = await loadMosqueDetail(env, String(params.slug));
  if (!detail) {
    const notFound = await env.ASSETS.fetch(new URL('/404', request.url));
    return new Response(notFound.body, { status: 404, headers: notFound.headers });
  }

  const { mosque } = detail;
  const url = new URL(request.url);
  const title = `${mosque.name} ${mosque.city !== mosque.name ? '· ' + mosque.city : ''} | Ahmadiyya Muslim Jamaat Schleswig-Holstein`;
  const description = mosque.shortDescription;
  const image = new URL(mosque.image, url.origin).href;
  // Prevent "</script>" breaking out of the JSON block.
  const payload = JSON.stringify(detail).replace(/</g, '\\u003c');

  const template = await env.ASSETS.fetch(new URL('/moschee', request.url));
  const rewritten = new HTMLRewriter()
    .on('title', { element(el) { el.setInnerContent(title); } })
    .on('meta[name="description"]', { element(el) { el.setAttribute('content', description); } })
    .on('head', {
      element(el) {
        el.append(
          `<meta property="og:title" content="${escAttr(title)}">` +
            `<meta property="og:description" content="${escAttr(description)}">` +
            `<meta property="og:image" content="${escAttr(image)}">` +
            `<meta property="og:type" content="place">` +
            `<link rel="canonical" href="${escAttr(url.origin + url.pathname)}">` +
            `<script id="initial-data" type="application/json">${payload}</script>`,
          { html: true }
        );
      }
    })
    .on('[data-ssr="name"]', { element(el) { el.setInnerContent(mosque.name); } })
    .on('[data-ssr="subtitle"]', { element(el) { el.setInnerContent(mosque.subtitle || mosque.city); } })
    .transform(template);

  const headers = new Headers(rewritten.headers);
  headers.set('Cache-Control', 'public, max-age=60, s-maxage=300');
  return new Response(rewritten.body, { status: 200, headers });
}
