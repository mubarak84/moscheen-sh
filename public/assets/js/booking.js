// Booking dialog ("Besuch anfragen"): visit type, group size, up to 3 preferred slots, interests, personal data.
import { api } from './api.js';
import { $, $$, escapeHtml, todayIso } from './ui.js';
import { handleSubmit, mountTurnstile, formToObject } from './forms.js';

const MAX_SLOTS = 3;
const TIMES = [];
for (let h = 9; h <= 20; h++) for (const m of ['00', '30']) TIMES.push(`${String(h).padStart(2, '0')}:${m}`);

const VISIT_TYPES = [
  ['individual', 'Einzelbesuch / Familie', '👤'],
  ['group', 'Gruppenbesuch', '👥'],
  ['school', 'Schulklasse / Kita', '🎒'],
  ['organization', 'Verein / Kirchengemeinde / Institution', '🏛️'],
  ['press', 'Presse / Medien', '📰']
];
const INTERESTS = [
  ['tour', 'Führung durch die Moschee'],
  ['prayer', 'Beim Gebet zuschauen'],
  ['talk', 'Gespräch / Vortrag über den Islam'],
  ['qa', 'Fragen & Antworten'],
  ['tea', 'Tee & Begegnung']
];

let dialog;
let state = { mosques: [], fixed: null };

function maxDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function slotHtml(i) {
  return `
  <div class="slot" data-slot>
    <div class="field"><label for="slot-date-${i}">Datum ${i + 1}. Wunsch${i === 0 ? ' <span class="req">*</span>' : ''}</label>
      <input id="slot-date-${i}" type="date" data-slot-date min="${todayIso()}" max="${maxDate()}"${i === 0 ? ' required' : ''}></div>
    <div class="field"><label for="slot-time-${i}">Uhrzeit</label>
      <select id="slot-time-${i}" data-slot-time${i === 0 ? ' required' : ''}>
        <option value="">– wählen –</option>${TIMES.map((t) => `<option value="${t}">${t} Uhr</option>`).join('')}
      </select></div>
    ${i === 0 ? '<span></span>' : '<button type="button" class="slot__remove" data-remove-slot aria-label="Termin entfernen">×</button>'}
  </div>`;
}

function formHtml() {
  const { fixed, mosques } = state;
  return `
  <form class="form" id="booking-form" novalidate>
    ${fixed
      ? `<input type="hidden" name="mosque" value="${escapeHtml(fixed.slug)}">`
      : `<div class="field"><label for="bk-mosque">Moschee <span class="req">*</span></label>
          <select id="bk-mosque" name="mosque" required><option value="">Bitte wählen …</option>
          ${mosques.map((m) => `<option value="${escapeHtml(m.slug)}">${escapeHtml(m.name)} – ${escapeHtml(m.city)}</option>`).join('')}</select>
          <span class="field__error" data-error-for="mosque"></span></div>`}

    <fieldset class="field">
      <legend>1. Art des Besuchs <span class="req">*</span></legend>
      <div class="choice-grid">
        ${VISIT_TYPES.map(([v, l, icon], i) => `<label class="choice"><input type="radio" name="visitType" value="${v}"${i === 0 ? ' checked required' : ''}><span><span aria-hidden="true">${icon}</span>${l}</span></label>`).join('')}
      </div>
      <span class="field__error" data-error-for="visitType"></span>
    </fieldset>

    <div class="form__row form__row--2" data-group-fields hidden>
      <div class="field"><label for="bk-size">Anzahl der Personen <span class="req">*</span></label>
        <input id="bk-size" name="groupSize" type="number" min="2" max="200" inputmode="numeric" value="10">
        <span class="field__error" data-error-for="groupSize"></span></div>
      <div class="field"><label for="bk-org">Schule / Organisation</label>
        <input id="bk-org" name="organization" maxlength="200" autocomplete="organization"></div>
    </div>

    <fieldset class="field">
      <legend>2. Wunschtermine <span class="req">*</span></legend>
      <span class="hint">Nennen Sie bis zu drei Termine – so finden wir schneller einen passenden.</span>
      <div data-slots>${slotHtml(0)}</div>
      <button type="button" class="link-btn" data-add-slot>+ Weiteren Wunschtermin hinzufügen</button>
      <span class="field__error" data-error-for="slots"></span>
    </fieldset>

    <fieldset class="field">
      <legend>Was interessiert Sie besonders?</legend>
      <div class="choice-grid">
        ${INTERESTS.map(([v, l]) => `<label class="choice"><input type="checkbox" name="interests" value="${v}"${v === 'tour' ? ' checked' : ''}><span>${l}</span></label>`).join('')}
      </div>
    </fieldset>

    <fieldset class="field">
      <legend>3. Ihre Kontaktdaten</legend>
      <div class="form__row form__row--2">
        <div class="field"><label for="bk-name">Vor- und Nachname <span class="req">*</span></label>
          <input id="bk-name" name="name" required minlength="2" maxlength="120" autocomplete="name">
          <span class="field__error" data-error-for="name"></span></div>
        <div class="field"><label for="bk-email">E-Mail-Adresse <span class="req">*</span></label>
          <input id="bk-email" name="email" type="email" required maxlength="254" autocomplete="email">
          <span class="field__error" data-error-for="email"></span></div>
      </div>
      <div class="form__row form__row--2">
        <div class="field"><label for="bk-phone">Telefon (optional)</label>
          <input id="bk-phone" name="phone" type="tel" maxlength="40" autocomplete="tel">
          <span class="field__error" data-error-for="phone"></span></div>
        <div class="field"><label for="bk-lang">Bevorzugte Sprache der Führung</label>
          <select id="bk-lang" name="language"><option value="de">Deutsch</option><option value="en">Englisch</option><option value="ur">Urdu</option><option value="ar">Arabisch</option></select></div>
      </div>
    </fieldset>

    <div class="field"><label for="bk-msg">Ihre Nachricht an uns</label>
      <textarea id="bk-msg" name="message" maxlength="2000" placeholder="z. B. Anlass des Besuchs, Vorkenntnisse, besondere Wünsche, Barrierefreiheit …"></textarea></div>

    <label class="check"><input type="checkbox" name="privacy" required>
      <span>Ich habe die <a href="/datenschutz" target="_blank">Datenschutzerklärung</a> gelesen und bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage verwendet werden. <span class="req">*</span></span></label>
    <span class="field__error" data-error-for="privacy"></span>

    <div class="hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
    <div class="turnstile"></div>
    <div class="form__status" role="alert" hidden></div>
    <p class="small muted">Hinweis: Besuche sind kostenlos. Frauen und Männer sind gleichermaßen willkommen. Wir melden uns innerhalb von 72 Stunden.</p>
    <div><button type="submit" class="btn btn--dark btn--lg">Besuchsanfrage senden</button></div>
  </form>`;
}

function successHtml(result, mosqueName) {
  return `
  <div class="success" tabindex="-1">
    <div class="success__icon"><svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#0f4c3a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    <h3>Vielen Dank für Ihre Anfrage!</h3>
    <p class="lead">Ihr Terminvorschlag für die <strong>${escapeHtml(mosqueName)}</strong> wird geprüft.<br>
      <strong>Wir melden uns innerhalb von 72 Stunden bei Ihnen.</strong></p>
    <p>Ihre Referenznummer:</p>
    <p><span class="success__ref">${escapeHtml(result.reference)}</span></p>
    <p class="muted small">Eine Bestätigung mit allen Angaben haben wir an Ihre E-Mail-Adresse gesendet. Bitte prüfen Sie ggf. auch Ihren Spam-Ordner.</p>
    <button type="button" class="btn btn--outline" data-close>Schließen</button>
  </div>`;
}

function serialize(form) {
  const data = formToObject(form);
  data.interests = [].concat(data.interests || []);
  data.slots = $$('[data-slot]', form).map((row) => ({
    date: $('[data-slot-date]', row).value,
    time: $('[data-slot-time]', row).value
  }));
  data.privacy = $('[name="privacy"]', form).checked;
  if (data.visitType === 'individual') data.groupSize = 1;
  return data;
}

function wireForm(form) {
  const groupFields = $('[data-group-fields]', form);
  const size = $('[name="groupSize"]', form);
  const syncGroup = () => {
    const isGroup = form.visitType.value !== 'individual';
    groupFields.hidden = !isGroup;
    size.required = isGroup;
  };
  $$('[name="visitType"]', form).forEach((r) => r.addEventListener('change', syncGroup));
  syncGroup();

  const slots = $('[data-slots]', form);
  const addBtn = $('[data-add-slot]', form);
  const syncAdd = () => (addBtn.hidden = $$('[data-slot]', slots).length >= MAX_SLOTS);
  addBtn.addEventListener('click', () => {
    const n = $$('[data-slot]', slots).length;
    if (n >= MAX_SLOTS) return;
    slots.insertAdjacentHTML('beforeend', slotHtml(n));
    $(`#slot-date-${n}`, form).focus();
    syncAdd();
  });
  slots.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove-slot]');
    if (!btn) return;
    btn.closest('[data-slot]').remove();
    // re-number remaining rows so ids/labels stay unique
    $$('[data-slot]', slots).forEach((row, i) => {
      const d = $('[data-slot-date]', row), t = $('[data-slot-time]', row);
      d.id = `slot-date-${i}`; t.id = `slot-time-${i}`;
      const [ld, lt] = $$('label', row);
      ld.htmlFor = d.id; lt.htmlFor = t.id;
      ld.innerHTML = `Datum ${i + 1}. Wunsch${i === 0 ? ' <span class="req">*</span>' : ''}`;
    });
    syncAdd();
  });

  mountTurnstile(form);
  handleSubmit(form, api.sendBooking, {
    serialize,
    onSuccess: (result) => {
      const slug = serialize(form).mosque;
      const m = state.fixed || state.mosques.find((x) => x.slug === slug) || { name: 'Moschee' };
      const body = $('.dialog__body', dialog);
      body.innerHTML = successHtml(result, m.name);
      $('.success', body).focus();
      $('[data-close]', body).addEventListener('click', () => dialog.close());
    }
  });
}

function ensureDialog() {
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.className = 'dialog';
  dialog.setAttribute('aria-labelledby', 'booking-title');
  dialog.innerHTML = `
    <div class="dialog__head">
      <div><span class="eyebrow" data-booking-mosque></span><h2 id="booking-title">Besuch anfragen</h2></div>
      <button type="button" class="dialog__close" aria-label="Dialog schließen" data-close>×</button>
    </div>
    <div class="dialog__body"></div>`;
  document.body.append(dialog);
  $('.dialog__head [data-close]', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); }); // backdrop click
  return dialog;
}

/**
 * Opens the booking dialog.
 * @param {{ mosque?: object, mosques?: object[] }} opts  pass `mosque` to fix the mosque (detail page)
 */
export function openBooking({ mosque = null, mosques = [] } = {}) {
  state = { fixed: mosque, mosques };
  const d = ensureDialog();
  $('[data-booking-mosque]', d).textContent = mosque ? `${mosque.name} · ${mosque.city}` : 'Moscheen in Schleswig-Holstein';
  const body = $('.dialog__body', d);
  body.innerHTML = formHtml();
  wireForm($('#booking-form', body));
  d.showModal();
  body.scrollTop = 0;
}
