// Card renderers shared by start page and detail page (events, highlights, visitor impressions).
import { escapeHtml, formatDate, formatTime, dayParts, stars, VISIT_TYPE_LABELS } from './ui.js';

const exampleTag = (x) => (x.isExample ? ' <span class="tag tag--example">Beispiel</span>' : '');

export function eventCards(events) {
  if (!events.length) return '<p class="empty">Aktuell sind keine Veranstaltungen geplant.</p>';
  return events.map((e) => {
    const p = dayParts(e.startsAt);
    return `
    <article class="card card--accent">
      <span class="card__date"><span class="card__date-day">${escapeHtml(p.day)}</span>${escapeHtml(p.month)} · ${escapeHtml(p.weekday)}</span>
      <h3>${escapeHtml(e.title)}${exampleTag(e)}</h3>
      <span class="card__meta">🕒 ${escapeHtml(formatTime(e.startsAt))} Uhr · 📍 ${escapeHtml(e.location)}</span>
      <p>${escapeHtml(e.description)}</p>
    </article>`;
  }).join('');
}

export function highlightCards(items) {
  if (!items.length) return '<p class="empty">Bald finden Sie hier Rückblicke auf unsere Veranstaltungen.</p>';
  return items.map((h) => `
    <article class="card">
      <span class="card__meta">${escapeHtml(formatDate(h.date))}</span>
      <h3>${escapeHtml(h.title)}${exampleTag(h)}</h3>
      <p>${escapeHtml(h.summary)}</p>
      ${h.link ? `<a href="${escapeHtml(h.link)}">Weiterlesen →</a>` : ''}
    </article>`).join('');
}

export function feedbackCards(items, { showMosque = true } = {}) {
  if (!items.length) return '<p class="empty">Noch keine Eindrücke vorhanden – teilen Sie als Erste/r Ihre Erfahrung!</p>';
  return items.map((f) => `
    <figure class="card quote">
      <span class="quote__stars" aria-label="${f.rating} von 5 Sternen">${stars(f.rating)}</span>
      <blockquote class="quote__text">${escapeHtml(f.text)}</blockquote>
      <figcaption>
        <span class="quote__author">${escapeHtml(f.name)}</span>${exampleTag(f)}<br>
        <span class="card__meta">${escapeHtml(VISIT_TYPE_LABELS[f.visitType] || 'Besuch')}${showMosque && f.mosqueName ? ` · <a href="/moscheen/${escapeHtml(f.mosqueSlug)}">${escapeHtml(f.mosqueName)}</a>` : ''}${f.visitedOn ? ` · ${escapeHtml(formatDate(f.visitedOn))}` : ''}</span>
      </figcaption>
    </figure>`).join('');
}
