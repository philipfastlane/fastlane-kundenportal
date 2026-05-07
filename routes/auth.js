const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { sendPasswordResetEmail, sendTwoFactorEmail } = require('../mailer');
const { validatePasswordStrength } = require('../utils/password');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-Mail und Passwort sind erforderlich' });
  }
  const customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email.toLowerCase().trim());
  if (!customer || !bcrypt.compareSync(password, customer.password_hash)) {
    if (customer) {
      db.prepare(`INSERT INTO activity_log (customer_id, event_type, description) VALUES (?, 'failed_login', 'Fehlgeschlagener Login-Versuch')`).run(customer.id);
    }
    return res.status(401).json({ error: 'Ungültige E-Mail-Adresse oder Passwort' });
  }

  if (customer.two_fa_enabled) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    db.prepare('UPDATE login_otp SET used = 1 WHERE customer_id = ?').run(customer.id);
    db.prepare('INSERT INTO login_otp (customer_id, code, expires_at) VALUES (?, ?, ?)').run(customer.id, code, expires);
    sendTwoFactorEmail(customer, code).catch((err) => console.error('2FA E-Mail Fehler:', err.message));
    return res.json({ requires_2fa: true, email: customer.email });
  }

  db.prepare(`INSERT INTO activity_log (customer_id, event_type, description) VALUES (?, 'login', 'Kunde hat sich angemeldet')`).run(customer.id);
  const previousLogin = customer.last_login;
  db.prepare(`UPDATE customers SET last_login = datetime('now') WHERE id = ?`).run(customer.id);

  const payload = { id: customer.id, name: customer.name, email: customer.email, company: customer.company };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { ...payload, must_change_password: customer.must_change_password === 1, last_login: previousLogin } });
});

router.post('/verify-2fa', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'E-Mail und Code erforderlich' });

  const customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email.toLowerCase().trim());
  if (!customer) return res.status(401).json({ error: 'Ungültiger Code' });

  const otp = db.prepare(`
    SELECT * FROM login_otp
    WHERE customer_id = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
  `).get(customer.id, code.trim());

  if (!otp) {
    db.prepare(`INSERT INTO activity_log (customer_id, event_type, description) VALUES (?, 'failed_login', 'Ungültiger 2FA-Code eingegeben')`).run(customer.id);
    return res.status(401).json({ error: 'Code ungültig oder abgelaufen' });
  }

  db.prepare('UPDATE login_otp SET used = 1 WHERE id = ?').run(otp.id);
  db.prepare(`INSERT INTO activity_log (customer_id, event_type, description) VALUES (?, 'login', 'Anmeldung mit 2FA')`).run(customer.id);
  const previousLogin = customer.last_login;
  db.prepare(`UPDATE customers SET last_login = datetime('now') WHERE id = ?`).run(customer.id);

  const payload = { id: customer.id, name: customer.name, email: customer.email, company: customer.company };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { ...payload, must_change_password: customer.must_change_password === 1, last_login: previousLogin } });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email?.trim()) return res.status(400).json({ error: 'E-Mail-Adresse erforderlich' });

  const customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email.toLowerCase().trim());
  if (!customer) return res.json({ success: true });

  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE customer_id = ? AND used = 0').run(customer.id);

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO password_reset_tokens (customer_id, token, expires_at) VALUES (?, ?, ?)').run(customer.id, token, expires);

  try {
    await sendPasswordResetEmail(customer, token);
  } catch (err) {
    console.error('Fehler beim Senden der Passwort-Reset-E-Mail:', err.message);
  }

  res.json({ success: true });
});

router.post('/reset-password', (req, res) => {
  const { token, password } = req.body;
  const strengthError = validatePasswordStrength(password);
  if (!token || strengthError) {
    return res.status(400).json({ error: strengthError || 'Ungültige Anfrage.' });
  }

  const row = db.prepare(`
    SELECT t.*, c.email FROM password_reset_tokens t
    JOIN customers c ON c.id = t.customer_id
    WHERE t.token = ? AND t.used = 0 AND t.expires_at > datetime('now')
  `).get(token);

  if (!row) return res.status(400).json({ error: 'Dieser Link ist ungültig oder abgelaufen.' });

  db.prepare('UPDATE customers SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(password, 10), row.customer_id);
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(row.id);

  res.json({ success: true });
});

module.exports = router;
