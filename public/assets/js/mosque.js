// Mosque detail page (/moscheen/:slug). Data comes inlined by functions/moscheen/[slug].js,
// with a fallback to the API (e.g. when opened via /moschee?slug=… in local static preview).
import { api } from './api.js';
import { $, $$, escapeHtml, initials, mapLink, initLayout } from './ui.js';
import { openBooking } from './booking.js';
import { eventCards, highlightCards, feedbackCards } from './cards.js';
import { feedbackFormHtml, initFeedbackForm } from './forms.js';

function slugFromUrl() {
  const m = location.pathname.match(/^\/moscheen\/([a-z0-9-]+)\/?$/);
  return m ? m[1] : new URLSearchParams(location.search).get('slug');
}

async function loadData() {
  const inline = document.getElementById('initial-data');
  if (inline) {
    try { return JSON.parse(inline.textContent); } catch { /* fall through */ }
  }
  const slug = slugFromUrl();
  if (!slug) throw new Error('not found');
  return api.mosque(slug);
}

function renderContacts(contacts) {
  if (!contacts.length) return '<p class="empty">Ansprechpartner werden in Kürze ergänzt.</p>';
  return contacts.map((c) => `
    <article class="contact">
      <div class="contact__avatar" aria-hidden="true">${c.photo ? `<img src="${escapeHtml(c.photo)}" alt="">` : escapeHtml(initials(c.name))}</div>
      <div>
        <div class="contact__name">${c.name === 'N. N.' ? 'Wird ergänzt' : escapeHtml(c.name)}</div>
        <div class="contact__role">${escapeHtml(c.role)}</div>
        <div class="contact__links">
          ${c.email ? `<a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a><br>` : ''}
          ${c.phone ? `<a href="tel:${escapeHtml(c.phone.replace(/[^+\d]/g, ''))}">${escapeHtml(c.phone)}</a>` : ''}
        </div>
      </div>
    </article>`).join('');
}

function render(d) {
  const { mosque: m, contacts, events, highlights, feedback } = d;
  document.title = `${m.name} · ${m.city} | Ahmadiyya Muslim Jamaat Schleswig-Holstein`;

  const img = $('#mosque-image');
  img.src = m.image;
  img.alt = m.imageAlt || m.name;
  $('[data-ssr="name"]').textContent = m.name;
  $('[data-ssr="subtitle"]').textContent = m.subtitle || m.city;
  $('#crumb-name').textContent = m.name;

  const paragraphs = String(m.description || '').split(/\n{2,}/).map((p) => `<p>${escapeHtml(p)}</p>`).join('');
  $('#mosque-description').innerHTML = paragraphs;
  $('#mosque-features').innerHTML = (m.features || []).map((f) => `<li>${escapeHtml(f)}</li>`).join('');

  const address = [m.street, [m.zip, m.city].filter(Boolean).join(' ')].filter(Boolean);
  $('#mosque-facts').innerHTML = `
    <div><dt>Adresse</dt><dd>${address.map(escapeHtml).join('<br>')}<br><a href="${mapLink(m)}" target="_blank" rel="noopener">Auf der Karte anzeigen ↗</a></dd></div>
    ${m.district ? `<div><dt>Region</dt><dd>${escapeHtml(m.district)}</dd></div>` : ''}
    ${m.openedYear ? `<div><dt>Eröffnet</dt><dd>${escapeHtml(m.openedYear)}</dd></div>` : ''}
    ${m.email ? `<div><dt>E-Mail</dt><dd><a href="mailto:${escapeHtml(m.email)}">${escapeHtml(m.email)}</a></dd></div>` : ''}
    ${m.phone ? `<div><dt>Telefon</dt><dd><a href="tel:${escapeHtml(m.phone.replace(/[^+\d]/g, ''))}">${escapeHtml(m.phone)}</a></dd></div>` : ''}`;

  $('#contact-list').innerHTML = renderContacts(contacts);
  $('#mosque-events').innerHTML = eventCards(events);
  $('#mosque-highlights').innerHTML = highlightCards(highlights);
  $('#mosque-feedback').innerHTML = feedbackCards(feedback, { showMosque: false });
  $('#mosque-city').textContent = m.city;

  $('#feedback-form-wrap').innerHTML = feedbackFormHtml({ fixedMosque: m.slug });
  initFeedbackForm($('#feedback-form'), [], m.slug);

  $$('[data-open-booking]').forEach((b) => b.addEventListener('click', () => openBooking({ mosque: m })));
  $('#detail-loading').hidden = true;
  $('#detail-content').hidden = false;
}

async function main() {
  initLayout();
  try {
    render(await loadData());
  } catch {
    $('#detail-loading').innerHTML = '<div class="wrap section"><h1>Moschee nicht gefunden</h1><p>Die gesuchte Seite existiert nicht. <a href="/#moscheen">Zur Übersicht aller Moscheen</a></p></div>';
  }
}

main();
