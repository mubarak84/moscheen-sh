// Shared UI helpers + site header/footer (rendered once here to avoid duplication across pages).

export const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const TZ = 'Europe/Berlin';
export const formatDate = (iso, opts = {}) =>
  new Intl.DateTimeFormat('de-DE', { timeZone: TZ, day: '2-digit', month: 'long', year: 'numeric', ...opts }).format(new Date(iso));
export const formatTime = (iso) =>
  new Intl.DateTimeFormat('de-DE', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
export const dayParts = (iso) => {
  const d = new Date(iso);
  return {
    day: new Intl.DateTimeFormat('de-DE', { timeZone: TZ, day: '2-digit' }).format(d),
    month: new Intl.DateTimeFormat('de-DE', { timeZone: TZ, month: 'short' }).format(d),
    weekday: new Intl.DateTimeFormat('de-DE', { timeZone: TZ, weekday: 'long' }).format(d)
  };
};

export const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
export const initials = (name) =>
  name === 'N. N.' ? '?' : name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');

export const VISIT_TYPE_LABELS = {
  individual: 'Einzelbesuch',
  group: 'Gruppenbesuch',
  school: 'Schulklasse',
  organization: 'Institution',
  press: 'Presse'
};

export const mapLink = (m) =>
  `https://www.openstreetmap.org/search?query=${encodeURIComponent([m.street, m.zip, m.city].filter(Boolean).join(', '))}`;

export function toast(message, ms = 4000) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.textContent = message;
  document.body.append(el);
  setTimeout(() => el.remove(), ms);
}

/* ---------------- Header & footer ---------------- */
const NAV = [
  { href: '/', label: 'Start' },
  { href: '/#moscheen', label: 'Moscheen' },
  { href: '/#aktuelles', label: 'Aktuelles' },
  { href: '/#eindruecke', label: 'Eindrücke' },
  { href: '/#kontakt', label: 'Kontakt' }
];

function renderHeader(el) {
  el.innerHTML = `
  <a class="skip-link" href="#main">Zum Inhalt springen</a>
  <div class="wrap site-header__inner">
    <a class="brand" href="/" aria-label="Startseite – Ahmadiyya Muslim Jamaat Schleswig-Holstein">
      <img class="brand__mark" src="/assets/img/logo.svg" alt="" width="40" height="40">
      <span class="brand__text"><span class="brand__name">Ahmadiyya Muslim Jamaat</span><span class="brand__region">Moscheen in Schleswig-Holstein</span></span>
    </a>
    <nav class="nav" aria-label="Hauptnavigation">
      <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="nav-list">
        <span class="visually-hidden">Menü öffnen</span>
        <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
      <ul class="nav__list" id="nav-list">
        ${NAV.map((n) => `<li><a href="${n.href}"${location.pathname === n.href ? ' aria-current="page"' : ''}>${n.label}</a></li>`).join('')}
      </ul>
    </nav>
  </div>`;
  const nav = $('.nav', el);
  const toggle = $('.nav__toggle', el);
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('nav--open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  $$('.nav__list a', el).forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('nav--open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

function renderFooter(el, mosques = []) {
  el.innerHTML = `
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <h3>Ahmadiyya Muslim Jamaat</h3>
        <p>Muslime, die an den Verheißenen Messias und Imam Mahdi, Hadhrat Mirza Ghulam Ahmad (as), glauben.</p>
        <p class="footer-motto">Liebe für alle, Hass für keinen.</p>
      </div>
      <div>
        <h3>Unsere Moscheen</h3>
        <ul id="footer-mosques">${mosques.map((m) => `<li><a href="/moscheen/${escapeHtml(m.slug)}">${escapeHtml(m.name)}, ${escapeHtml(m.city)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h3>Weitere Informationen</h3>
        <ul>
          <li><a href="https://ahmadiyya.de" rel="noopener" target="_blank">ahmadiyya.de</a></li>
          <li><a href="https://www.alislam.org" rel="noopener" target="_blank">alislam.org</a></li>
          <li><a href="/#kontakt">Kontakt</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} Ahmadiyya Muslim Jamaat · Schleswig-Holstein</span>
      <span><a href="/impressum">Impressum</a> · <a href="/datenschutz">Datenschutz</a></span>
    </div>
  </div>`;
}

/** Call on every page. Returns the mosque list (used for footer + forms). */
export async function initLayout() {
  const header = $('[data-layout="header"]');
  const footer = $('[data-layout="footer"]');
  if (header) renderHeader(header);
  if (footer) renderFooter(footer);
  try {
    const { api } = await import('./api.js');
    const mosques = await api.mosques();
    if (footer) renderFooter(footer, mosques);
    return mosques;
  } catch {
    return [];
  }
}

/** Show server-side validation errors next to fields: details = { fieldName: message }. */
export function showFieldErrors(form, details = {}) {
  $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
  $$('.field__error', form).forEach((el) => (el.textContent = ''));
  let first = null;
  for (const [name, msg] of Object.entries(details)) {
    const errEl = $(`[data-error-for="${name}"]`, form);
    if (errEl) errEl.textContent = msg;
    const input = $(`[name="${name}"]`, form);
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      first = first || input;
    }
  }
  if (first) first.focus();
}

export function todayIso() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
