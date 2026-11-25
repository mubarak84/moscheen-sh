// The ONLY module that knows API endpoints. All data comes from Cloudflare Pages Functions (/api/*).

async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
    ...options
  });
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON */ }
  if (!res.ok || !data || data.ok === false) {
    const err = new Error((data && data.error) || 'Die Anfrage ist fehlgeschlagen. Bitte versuchen Sie es später erneut.');
    err.status = res.status;
    err.details = data && data.details;
    throw err;
  }
  return data;
}

const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });

export const api = {
  config: () => request('/api/config'),
  mosques: () => request('/api/mosques').then((d) => d.mosques),
  mosque: (slug) => request(`/api/mosques/${encodeURIComponent(slug)}`),
  events: (params = {}) => request(`/api/events?${new URLSearchParams(params)}`).then((d) => d.events),
  highlights: (params = {}) => request(`/api/highlights?${new URLSearchParams(params)}`).then((d) => d.highlights),
  feedback: (params = {}) => request(`/api/feedback?${new URLSearchParams(params)}`).then((d) => d.feedback),
  sendBooking: (body) => post('/api/bookings', body),
  sendContact: (body) => post('/api/contact', body),
  sendFeedback: (body) => post('/api/feedback', body)
};
