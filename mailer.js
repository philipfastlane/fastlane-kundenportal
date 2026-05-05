const nodemailer = require('nodemailer');

const PORTAL_URL = process.env.PORTAL_URL || 'http://localhost:5173';

function getFrom() {
  return `"FastLane Solutions" <${process.env.EMAIL_USER || 'philip@fastlanesolutions.de'}>`;
}

// --- Transport -----------------------------------------------------------
function createTransport() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      host:   'smtp.gmail.com',
      port:   465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  // Development fallback: log to console, no actual sending
  return null;
}

async function send(to, subject, html, textFallback) {
  const transport = createTransport();
  if (transport) {
    await transport.sendMail({ from: getFrom(), to, subject, html, text: textFallback });
    console.log(`📧 E-Mail gesendet an ${to}: ${subject}`);
  } else {
    // Console preview when SMTP is not configured
    const line = '─'.repeat(62);
    console.log(`\n${line}`);
    console.log(`📧  E-MAIL (Vorschau – kein SMTP konfiguriert)`);
    console.log(line);
    console.log(`An:      ${to}`);
    console.log(`Betreff: ${subject}`);
    console.log(line);
    console.log(textFallback);
    console.log(`${line}\n`);
  }
}

// --- HTML wrapper --------------------------------------------------------
function wrap(content) {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f2ec;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2ec;padding:36px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.07);">
  <tr>
    <td style="background:#141414;padding:22px 32px;">
      <span style="font-size:22px;font-weight:700;color:#a8cc30;letter-spacing:-.5px;">FastLane</span><span style="font-size:22px;font-weight:400;color:#ffffff;"> Solutions</span>
      <span style="float:right;background:rgba(168,204,48,.15);color:#a8cc30;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;border:1px solid rgba(168,204,48,.3);margin-top:4px;">Kundenportal</span>
    </td>
  </tr>
  <tr><td style="padding:32px 36px;">${content}</td></tr>
  <tr>
    <td style="background:#f8f8f6;border-top:1px solid #e8ead4;padding:18px 36px;">
      <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
        Diese E-Mail wurde automatisch von <strong>FastLane Solutions</strong> generiert.<br>
        Bei Fragen wenden Sie sich an <a href="mailto:philip@fastlanesolutions.de" style="color:#a8cc30;">philip@fastlanesolutions.de</a>
      </p>
    </td>
  </tr>
</table>
</td></tr></table>
</body></html>`;
}

const h2 = (t) => `<h2 style="margin:0 0 16px;font-size:20px;color:#141414;">${t}</h2>`;
const p  = (t) => `<p style="margin:0 0 14px;font-size:14px;color:#444;line-height:1.7;">${t}</p>`;
const btn = (url, label) => `<div style="margin:22px 0;"><a href="${url}" style="display:inline-block;background:#a8cc30;color:#141414;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">${label}</a></div>`;
const box = (rows) => `<div style="background:#f8f9f4;border:1px solid #e2e8c8;border-radius:8px;padding:18px 22px;margin:18px 0;">${rows.map(([k,v]) => `<div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;"><span style="color:#777;">${k}</span><strong style="color:#141414;">${v}</strong></div>`).join('')}</div>`;

// --- Email functions -----------------------------------------------------

async function sendWelcomeEmail(customer, password) {
  const subject = 'Willkommen bei FastLane Solutions – Ihr Portalzugang';
  const html = wrap(
    h2('Herzlich willkommen!') +
    p(`Hallo <strong>${customer.name}</strong>,<br>Ihr persönlicher Kundenportal-Zugang wurde eingerichtet. Ab sofort haben Sie jederzeit Zugriff auf Ihre Verträge, Rechnungen und Support-Tickets.`) +
    box([['Portal', PORTAL_URL], ['E-Mail', customer.email], ['Einmalpasswort', `<span style="font-family:monospace;font-size:15px;color:#a8cc30;">${password}</span>`]]) +
    p('Bitte ändern Sie Ihr Passwort nach der ersten Anmeldung.') +
    btn(PORTAL_URL, 'Jetzt anmelden') +
    p('<small style="color:#999;">Dieses Passwort ist nur für Ihre erste Anmeldung gültig. Bewahren Sie es sicher auf.</small>')
  );
  const text = `Hallo ${customer.name},\n\nIhr FastLane Kundenportal-Zugang:\nPortal: ${PORTAL_URL}\nE-Mail: ${customer.email}\nPasswort: ${password}\n\nBitte ändern Sie Ihr Passwort nach der ersten Anmeldung.\n\nMit freundlichen Grüßen,\nFastLane Solutions`;
  await send(customer.email, subject, html, text);
}

async function sendPasswordResetEmail(customer, resetToken) {
  const resetUrl = `${PORTAL_URL}/passwort-zuruecksetzen?token=${resetToken}`;
  const subject = 'Passwort zurücksetzen – FastLane Kundenportal';
  const html = wrap(
    h2('Passwort zurücksetzen') +
    p(`Hallo <strong>${customer.name}</strong>,<br>wir haben eine Anfrage erhalten, das Passwort für Ihr Kundenkonto zurückzusetzen.`) +
    btn(resetUrl, 'Neues Passwort festlegen') +
    p('Dieser Link ist <strong>1 Stunde gültig</strong> und kann nur einmal verwendet werden.') +
    p('Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren. Ihr Konto bleibt unverändert.')
  );
  const text = `Hallo ${customer.name},\n\nPasswort zurücksetzen:\n${resetUrl}\n\nDieser Link ist 1 Stunde gültig.\n\nFastLane Solutions`;
  await send(customer.email, subject, html, text);
}

async function sendNewInvoiceEmail(customer, invoice) {
  const fmt = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  const subject = `Neue Rechnung ${invoice.invoice_number} – FastLane Solutions`;
  const html = wrap(
    h2('Neue Rechnung erhalten') +
    p(`Hallo <strong>${customer.name}</strong>,<br>es liegt eine neue Rechnung für Ihr Konto vor.`) +
    box([
      ['Rechnungsnummer', invoice.invoice_number],
      ['Bezeichnung', invoice.title],
      ['Betrag', fmt(invoice.amount)],
      ['Fällig am', fmtDate(invoice.due_date)],
      ['Status', invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)],
    ]) +
    btn(`${PORTAL_URL}/rechnungen`, 'Rechnung im Portal ansehen')
  );
  const text = `Hallo ${customer.name},\n\nNeue Rechnung: ${invoice.invoice_number}\nBezeichnung: ${invoice.title}\nBetrag: ${fmt(invoice.amount)}\nFällig: ${fmtDate(invoice.due_date)}\n\n${PORTAL_URL}/rechnungen\n\nFastLane Solutions`;
  await send(customer.email, subject, html, text);
}

async function sendNewContractEmail(customer, contract) {
  const fmt = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  const subject = `Neuer Vertrag: ${contract.title} – FastLane Solutions`;
  const html = wrap(
    h2('Neuer Vertrag bereitgestellt') +
    p(`Hallo <strong>${customer.name}</strong>,<br>ein neuer Vertrag wurde für Ihr Konto eingerichtet.`) +
    box([
      ['Vertrag', contract.title],
      ['Status', contract.status.charAt(0).toUpperCase() + contract.status.slice(1)],
      ['Jahreswert', fmt(contract.value)],
      ['Laufzeit', `${fmtDate(contract.start_date)} – ${fmtDate(contract.end_date)}`],
    ]) +
    (contract.description ? p(`<em>${contract.description}</em>`) : '') +
    btn(`${PORTAL_URL}/vertraege`, 'Vertrag im Portal ansehen')
  );
  const text = `Hallo ${customer.name},\n\nNeuer Vertrag: ${contract.title}\nJahreswert: ${fmt(contract.value)}\n\n${PORTAL_URL}/vertraege\n\nFastLane Solutions`;
  await send(customer.email, subject, html, text);
}

async function sendTicketReplyEmail(customer, ticket, reply, adminName) {
  const subject = `Antwort auf Ihr Ticket: ${ticket.title}`;
  const html = wrap(
    h2('Neue Antwort auf Ihr Support-Ticket') +
    p(`Hallo <strong>${customer.name}</strong>,<br>Ihr Support-Ticket wurde von unserem Team beantwortet.`) +
    box([['Ticket', ticket.title], ['Von', `${adminName} (FastLane Solutions)`]]) +
    `<div style="background:#f0f4e8;border-left:3px solid #a8cc30;border-radius:0 8px 8px 0;padding:16px 20px;margin:18px 0;font-size:14px;color:#333;line-height:1.7;">${reply.replace(/\n/g, '<br>')}</div>` +
    btn(`${PORTAL_URL}/tickets`, 'Im Portal antworten')
  );
  const text = `Hallo ${customer.name},\n\nNeue Antwort auf Ticket: ${ticket.title}\nVon: ${adminName}\n\n${reply}\n\n${PORTAL_URL}/tickets\n\nFastLane Solutions`;
  await send(customer.email, subject, html, text);
}

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendNewInvoiceEmail,
  sendNewContractEmail,
  sendTicketReplyEmail,
};
