/** German email texts. Each builder returns { subject, html, text }. */
import { VISIT_TYPES, INTERESTS, LANGUAGES } from './validation.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const fmtDate = (d) => {
  const [y, m, day] = d.split('-');
  return `${day}.${m}.${y}`;
};

function layout(title, bodyHtml, siteName) {
  return `<!doctype html><html lang="de"><body style="margin:0;background:#f5f1e8;font-family:Segoe UI,Arial,sans-serif;color:#1f2a24">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#0f4c3a;color:#fff;padding:20px 28px;font-size:18px;font-weight:600">${esc(siteName)}</td></tr>
<tr><td style="padding:28px"><h1 style="font-size:20px;margin:0 0 16px">${esc(title)}</h1>${bodyHtml}</td></tr>
<tr><td style="padding:16px 28px;background:#faf8f3;color:#6b736e;font-size:12px">Liebe für alle, Hass für keinen.</td></tr>
</table></td></tr></table></body></html>`;
}

function rows(pairs) {
  return `<table role="presentation" cellpadding="6" cellspacing="0" style="font-size:14px;border-collapse:collapse">${pairs
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="color:#6b736e;vertical-align:top;white-space:nowrap">${esc(k)}</td><td>${v}</td></tr>`)
    .join('')}</table>`;
}

function bookingFacts(b, mosque) {
  const slots = b.slots.map((s) => `${fmtDate(s.date)}, ${s.time} Uhr`);
  return [
    ['Referenz', esc(b.reference)],
    ['Moschee', esc(`${mosque.name}, ${mosque.city}`)],
    ['Art des Besuchs', esc(VISIT_TYPES[b.visitType])],
    ['Personen', esc(b.groupSize)],
    ['Organisation', esc(b.organization)],
    ['Wunschtermine', slots.map(esc).join('<br>')],
    ['Interessen', b.interests.map((i) => esc(INTERESTS[i])).join(', ')],
    ['Sprache', esc(LANGUAGES[b.language])],
    ['Name', esc(b.name)],
    ['E-Mail', esc(b.email)],
    ['Telefon', esc(b.phone)],
    ['Nachricht', esc(b.message).replace(/\n/g, '<br>')]
  ];
}

function factsText(pairs) {
  return pairs
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${String(v).replace(/<br>/g, '\n  ').replace(/&[a-z#0-9]+;/g, (e) => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" })[e] || e)}`)
    .join('\n');
}

export function bookingConfirmation(b, mosque, siteName) {
  const facts = bookingFacts(b, mosque);
  const intro = `<p>Assalamo Alaikum – Friede sei mit Ihnen, ${esc(b.name)},</p>
<p>vielen Dank für Ihr Interesse an einem Besuch der <strong>${esc(mosque.name)}</strong>. Wir haben Ihre Anfrage erhalten.</p>
<p style="background:#eef6f1;border-left:4px solid #0f4c3a;padding:12px 16px"><strong>Ihr Terminvorschlag wird geprüft. Wir melden uns innerhalb von 72 Stunden bei Ihnen</strong>, um den Termin zu bestätigen oder eine Alternative vorzuschlagen.</p>
<p>Ihre Angaben im Überblick:</p>`;
  return {
    subject: `Ihre Besuchsanfrage ${b.reference} – ${mosque.name}`,
    html: layout('Ihre Besuchsanfrage ist eingegangen', intro + rows(facts) + '<p>Herzliche Grüße<br>Ihre Ahmadiyya Muslim Jamaat</p>', siteName),
    text: `Friede sei mit Ihnen, ${b.name},\n\nvielen Dank für Ihr Interesse an einem Besuch der ${mosque.name}.\nIhr Terminvorschlag wird geprüft. Wir melden uns innerhalb von 72 Stunden bei Ihnen.\n\n${factsText(facts)}\n\nHerzliche Grüße\nIhre Ahmadiyya Muslim Jamaat`
  };
}

export function bookingNotification(b, mosque, siteName) {
  const facts = bookingFacts(b, mosque);
  return {
    subject: `Neue Besuchsanfrage ${b.reference}: ${VISIT_TYPES[b.visitType]} – ${mosque.city}`,
    html: layout('Neue Besuchsanfrage', `<p>Bitte innerhalb von 72 Stunden antworten (einfach auf diese E-Mail antworten).</p>${rows(facts)}`, siteName),
    text: `Neue Besuchsanfrage – bitte innerhalb von 72 Stunden antworten.\n\n${factsText(facts)}`
  };
}

export function contactConfirmation(c, siteName) {
  return {
    subject: 'Ihre Nachricht ist bei uns eingegangen',
    html: layout('Vielen Dank für Ihre Nachricht', `<p>Guten Tag ${esc(c.name)},</p><p>wir haben Ihre Nachricht erhalten und melden uns so bald wie möglich, in der Regel innerhalb von 72 Stunden.</p><p>Herzliche Grüße<br>Ihre Ahmadiyya Muslim Jamaat</p>`, siteName),
    text: `Guten Tag ${c.name},\n\nwir haben Ihre Nachricht erhalten und melden uns so bald wie möglich, in der Regel innerhalb von 72 Stunden.\n\nHerzliche Grüße\nIhre Ahmadiyya Muslim Jamaat`
  };
}

export function contactNotification(c, mosque, siteName) {
  const facts = [
    ['Moschee', esc(mosque ? `${mosque.name}, ${mosque.city}` : 'allgemein')],
    ['Betreff', esc(c.subject)],
    ['Name', esc(c.name)],
    ['E-Mail', esc(c.email)],
    ['Nachricht', esc(c.message).replace(/\n/g, '<br>')]
  ];
  return {
    subject: `Kontaktformular: ${c.subject}`,
    html: layout('Neue Nachricht über das Kontaktformular', rows(facts), siteName),
    text: factsText(facts)
  };
}

export function feedbackNotification(f, mosque, siteName) {
  const facts = [
    ['Moschee', esc(`${mosque.name}, ${mosque.city}`)],
    ['Name', esc(f.name)],
    ['E-Mail', esc(f.email)],
    ['Art des Besuchs', esc(VISIT_TYPES[f.visitType])],
    ['Bewertung', '★'.repeat(f.rating) + '☆'.repeat(5 - f.rating)],
    ['Besucht am', f.visitedOn ? esc(fmtDate(f.visitedOn)) : ''],
    ['Eindruck', esc(f.text).replace(/\n/g, '<br>')]
  ];
  return {
    subject: `Neues Besucher-Feedback (zur Freigabe) – ${mosque.city}`,
    html: layout('Neues Feedback – wartet auf Freigabe', rows(facts), siteName),
    text: factsText(facts)
  };
}
