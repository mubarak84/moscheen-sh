// Start page: hero slider (welcome + events + highlights), mosque tiles, news, impressions, contact form.
import { api } from './api.js';
import { $, $$, escapeHtml, formatDate, formatTime, dayParts, initLayout } from './ui.js';
import { eventCards, highlightCards, feedbackCards } from './cards.js';
import { openBooking } from './booking.js';
import { initContactForm, initFeedbackForm, feedbackFormHtml } from './forms.js';

/* ---------------- Hero slider ---------------- */
function eventSlide(e) {
  const p = dayParts(e.startsAt);
  return `
  <div class="hero__slide" role="group" aria-roledescription="Folie" aria-label="Veranstaltung: ${escapeHtml(e.title)}">
    <div class="hero__slide-bg"><img src="${escapeHtml(e.image || '/assets/img/mosques/placeholder.svg')}" alt="" loading="lazy"></div>
    <div class="wrap"><div class="hero__content">
      <span class="hero__badge">Nächste Veranstaltung</span>
      <h2>${escapeHtml(e.title)}</h2>
      <div class="hero__meta"><span>📅 ${escapeHtml(p.weekday)}, ${escapeHtml(formatDate(e.startsAt))}</span><span>🕒 ${escapeHtml(formatTime(e.startsAt))} Uhr</span><span>📍 ${escapeHtml(e.location)}</span></div>
      <p class="hero__lead">${escapeHtml(e.description)}</p>
      <div class="hero__actions"><a class="btn btn--primary" href="#aktuelles">Alle Termine</a></div>
    </div></div>
  </div>`;
}

function highlightSlide(h) {
  return `
  <div class="hero__slide" role="group" aria-roledescription="Folie" aria-label="Rückblick: ${escapeHtml(h.title)}">
    <div class="hero__slide-bg"><img src="${escapeHtml(h.image || '/assets/img/mosques/placeholder.svg')}" alt="" loading="lazy"></div>
    <div class="wrap"><div class="hero__content">
      <span class="hero__badge">Rückblick · ${escapeHtml(formatDate(h.date))}</span>
      <h2>${escapeHtml(h.title)}</h2>
      <p class="hero__lead">${escapeHtml(h.summary)}</p>
      <div class="hero__actions"><a class="btn btn--ghost" href="${escapeHtml(h.link || '#aktuelles')}">Mehr erfahren</a></div>
    </div></div>
  </div>`;
}

function initSlider(root, extraSlides) {
  const track = $('.hero__slides', root);
  track.insertAdjacentHTML('beforeend', extraSlides.join(''));
  const slides = $$('.hero__slide', track);
  const controls = $('.hero__controls', root);
  if (slides.length < 2) return;

  const dots = $('.hero__dots', root);
  dots.innerHTML = slides.map((_, i) => `<button class="hero__dot" type="button" aria-label="Folie ${i + 1} von ${slides.length}"></button>`).join('');
  controls.hidden = false;

  let index = 0;
  let timer = null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pauseBtn = $('.hero__pause', root);

  const show = (i) => {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => {
      s.classList.toggle('is-active', n === index);
      s.setAttribute('aria-hidden', String(n !== index));
      s.inert = n !== index;
    });
    $$('.hero__dot', dots).forEach((d, n) => d.setAttribute('aria-current', String(n === index)));
  };
  const play = () => { stop(); timer = setInterval(() => show(index + 1), 7000); pauseBtn.setAttribute('aria-label', 'Automatischen Wechsel pausieren'); pauseBtn.textContent = '❚❚'; };
  const stop = () => { clearInterval(timer); timer = null; pauseBtn.setAttribute('aria-label', 'Automatischen Wechsel starten'); pauseBtn.textContent = '▶'; };

  $$('.hero__dot', dots).forEach((d, n) => d.addEventListener('click', () => { show(n); stop(); }));
  $('[data-prev]', root).addEventListener('click', () => { show(index - 1); stop(); });
  $('[data-next]', root).addEventListener('click', () => { show(index + 1); stop(); });
  pauseBtn.addEventListener('click', () => (timer ? stop() : play()));
  root.addEventListener('focusin', stop);

  show(0);
  if (!reduced) play(); else stop();
}

/* ---------------- Sections ---------------- */
function renderTiles(el, mosques) {
  if (!mosques.length) { el.innerHTML = '<p class="empty">Derzeit sind keine Moscheen verfügbar.</p>'; return; }
  el.innerHTML = mosques.map((m) => `
    <a class="tile" href="/moscheen/${escapeHtml(m.slug)}">
      <div class="tile__img"><img src="${escapeHtml(m.image)}" alt="${escapeHtml(m.imageAlt || m.name)}" loading="lazy" width="640" height="400"></div>
      <span class="tile__type">${m.type === 'center' ? 'Gemeindezentrum' : 'Moschee'}</span>
      <div class="tile__body">
        <span class="tile__city">${escapeHtml(m.city)}</span>
        <h3 class="tile__title">${escapeHtml(m.name)}</h3>
        <p class="tile__text">${escapeHtml(m.shortDescription)}</p>
        <span class="tile__more">Mehr erfahren & Besuch anfragen →</span>
      </div>
    </a>`).join('');
}

/* ---------------- Boot ---------------- */
async function main() {
  const mosquesPromise = initLayout();
  const [mosques, events, highlights, feedback] = await Promise.all([
    mosquesPromise,
    api.events({ limit: 6 }).catch(() => []),
    api.highlights({ limit: 6 }).catch(() => []),
    api.feedback({ limit: 6 }).catch(() => [])
  ]);

  initSlider($('#hero'), [...events.slice(0, 2).map(eventSlide), ...highlights.slice(0, 2).map(highlightSlide)]);
  $('#stat-count').textContent = String(mosques.length || '–');
  renderTiles($('#mosque-tiles'), mosques);
  $('#event-list').innerHTML = eventCards(events);
  $('#highlight-list').innerHTML = highlightCards(highlights);
  $('#feedback-list').innerHTML = feedbackCards(feedback);

  $$('[data-open-booking]').forEach((b) => b.addEventListener('click', () => openBooking({ mosques })));

  const fbWrap = $('#feedback-form-wrap');
  $('[data-toggle-feedback]').addEventListener('click', (e) => {
    if (!fbWrap.innerHTML.trim()) {
      fbWrap.innerHTML = feedbackFormHtml();
      initFeedbackForm($('#feedback-form', fbWrap), mosques);
    }
    fbWrap.hidden = !fbWrap.hidden;
    e.currentTarget.setAttribute('aria-expanded', String(!fbWrap.hidden));
  });

  initContactForm($('#contact-form'), mosques);
}

main();
