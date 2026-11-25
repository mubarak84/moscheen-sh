// Shared form logic: serialisation, submit handling, Cloudflare Turnstile, contact & feedback forms.
import { api } from './api.js';
import { $, $$, escapeHtml, showFieldErrors, todayIso } from './ui.js';

/* ---------------- Turnstile (only if a site key is configured) ---------------- */
let configPromise;
const getConfig = () => (configPromise ||= api.config().catch(() => ({ turnstileSiteKey: null })));

let turnstileLoading;
function loadTurnstile() {
  return (turnstileLoading ||= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => resolve(window.turnstile);
    s.onerror = reject;
    document.head.append(s);
  }));
}

/** Renders a Turnstile widget into `.turnstile` inside the form (no-op without site key). */
export async function mountTurnstile(form) {
  const box = $('.turnstile', form);
  if (!box || box.dataset.mounted) return;
  const { turnstileSiteKey } = await getConfig();
  if (!turnstileSiteKey) return;
  const ts = await loadTurnstile();
  box.dataset.mounted = '1';
  box.dataset.widgetId = ts.render(box, { sitekey: turnstileSiteKey, language: 'de', theme: 'light' });
}

function resetTurnstile(form) {
  const box = $('.turnstile', form);
  if (box && box.dataset.widgetId && window.turnstile) window.turnstile.reset(box.dataset.widgetId);
}

/* ---------------- Serialisation ---------------- */
export function formToObject(form) {
  const obj = {};
  for (const [k, v] of new FormData(form).entries()) {
    if (k in obj) obj[k] = [].concat(obj[k], v);
    else obj[k] = v;
  }
  return obj;
}

/**
 * Generic submit handler.
 * @param {HTMLFormElement} form
 * @param {(data:object)=>Promise<object>} send
 * @param {{ serialize?: (form)=>object, onSuccess: (result)=>void }} opts
 */
export function handleSubmit(form, send, { serialize = formToObject, onSuccess }) {
  const status = $('.form__status', form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const btn = $('[type="submit"]', form);
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Wird gesendet …';
    status.hidden = true;
    try {
      const result = await send(serialize(form));
      showFieldErrors(form, {});
      onSuccess(result);
    } catch (err) {
      if (err.details) showFieldErrors(form, err.details);
      status.className = 'form__status alert alert--error';
      status.textContent = err.message;
      status.hidden = false;
      resetTurnstile(form);
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
}

const mosqueOptions = (mosques, selected = '') =>
  mosques.map((m) => `<option value="${escapeHtml(m.slug)}"${m.slug === selected ? ' selected' : ''}>${escapeHtml(m.name)} – ${escapeHtml(m.city)}</option>`).join('');

/* ---------------- Contact form ---------------- */
export function initContactForm(form, mosques) {
  if (!form) return;
  $('[name="mosque"]', form).insertAdjacentHTML('beforeend', mosqueOptions(mosques));
  mountTurnstile(form);
  handleSubmit(form, api.sendContact, {
    onSuccess: (r) => {
      form.reset();
      const s = $('.form__status', form);
      s.className = 'form__status alert alert--success';
      s.textContent = r.message;
      s.hidden = false;
      resetTurnstile(form);
    }
  });
}

/* ---------------- Feedback form ---------------- */
export function initFeedbackForm(form, mosques, preselect = '') {
  if (!form) return;
  const sel = $('[name="mosque"]', form);
  if (sel) sel.insertAdjacentHTML('beforeend', mosqueOptions(mosques, preselect));
  const visited = $('[name="visitedOn"]', form);
  if (visited) visited.max = todayIso();
  mountTurnstile(form);
  handleSubmit(form, api.sendFeedback, {
    onSuccess: (r) => {
      form.reset();
      if (sel && preselect) sel.value = preselect;
      const s = $('.form__status', form);
      s.className = 'form__status alert alert--success';
      s.textContent = r.message;
      s.hidden = false;
      resetTurnstile(form);
    }
  });
}

/** Markup for the feedback form (used on start page and detail page). */
export function feedbackFormHtml({ fixedMosque = null } = {}) {
  return `
  <form class="form" id="feedback-form" novalidate>
    ${fixedMosque
      ? `<input type="hidden" name="mosque" value="${escapeHtml(fixedMosque)}">`
      : `<div class="field"><label for="fb-mosque">Welche Moschee haben Sie besucht? <span class="req">*</span></label>
         <select id="fb-mosque" name="mosque" required><option value="">Bitte wählen …</option></select>
         <span class="field__error" data-error-for="mosque"></span></div>`}
    <div class="form__row form__row--2">
      <div class="field"><label for="fb-name">Name (wird veröffentlicht) <span class="req">*</span></label>
        <input id="fb-name" name="name" required minlength="2" maxlength="80" autocomplete="name" placeholder="z. B. Anna K. oder Klasse 9a">
        <span class="field__error" data-error-for="name"></span></div>
      <div class="field"><label for="fb-email">E-Mail (wird nicht veröffentlicht)</label>
        <input id="fb-email" name="email" type="email" maxlength="254" autocomplete="email">
        <span class="field__error" data-error-for="email"></span></div>
    </div>
    <div class="form__row form__row--2">
      <div class="field"><label for="fb-type">Art des Besuchs</label>
        <select id="fb-type" name="visitType">
          <option value="individual">Einzelbesuch / Familie</option><option value="group">Gruppenbesuch</option>
          <option value="school">Schulklasse / Kita</option><option value="organization">Verein / Institution</option>
        </select></div>
      <div class="field"><label for="fb-date">Datum des Besuchs</label>
        <input id="fb-date" name="visitedOn" type="date"></div>
    </div>
    <fieldset class="field">
      <legend>Ihre Bewertung <span class="req">*</span></legend>
      <div class="stars">
        ${[5, 4, 3, 2, 1].map((n) => `<input type="radio" id="fb-r${n}" name="rating" value="${n}"${n === 5 ? ' required' : ''}><label for="fb-r${n}" title="${n} von 5 Sternen">★<span class="visually-hidden">${n} von 5 Sternen</span></label>`).join('')}
      </div>
      <span class="field__error" data-error-for="rating"></span>
    </fieldset>
    <div class="field"><label for="fb-text">Ihr Eindruck <span class="req">*</span></label>
      <textarea id="fb-text" name="text" required minlength="20" maxlength="1500" placeholder="Was hat Sie bei Ihrem Besuch beeindruckt?"></textarea>
      <span class="field__error" data-error-for="text"></span></div>
    <label class="check"><input type="checkbox" name="privacy" required>
      <span>Ich bin einverstanden, dass mein Beitrag mit dem angegebenen Namen nach Prüfung veröffentlicht wird, und habe die <a href="/datenschutz" target="_blank">Datenschutzerklärung</a> gelesen. <span class="req">*</span></span></label>
    <span class="field__error" data-error-for="privacy"></span>
    <div class="hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
    <div class="turnstile"></div>
    <div class="form__status" role="status" aria-live="polite" hidden></div>
    <div><button class="btn btn--dark" type="submit">Feedback senden</button></div>
  </form>`;
}
