/**
 * Email sending via the Resend REST API (https://resend.com/docs/api-reference/emails/send-email).
 * Works with plain fetch in the Workers runtime – no SDK needed.
 *
 * Config:
 *   secret RESEND_API_KEY  – API key; if missing, the email is logged instead (dev / pre-launch)
 *   var    MAIL_FROM       – sender, domain must be verified in Resend
 *
 * To switch provider later (e.g. Cloudflare Email Service), only change this file.
 */
export async function sendEmail(env, { to, subject, html, text, replyTo }) {
  const recipients = [].concat(to).filter(Boolean);
  if (!recipients.length) return { ok: false, skipped: true, reason: 'no recipient' };

  if (!env.RESEND_API_KEY) {
    console.log(`[email:dev] to=${recipients.join(',')} subject="${subject}"\n${text}`);
    return { ok: true, dev: true };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: recipients,
      subject,
      html,
      text,
      ...(replyTo ? { reply_to: replyTo } : {})
    })
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error(`[email] Resend error ${res.status}: ${detail.slice(0, 300)}`);
    return { ok: false, status: res.status };
  }
  const data = await res.json().catch(() => ({}));
  return { ok: true, id: data.id };
}
