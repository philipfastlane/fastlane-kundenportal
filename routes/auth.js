const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { sendPasswordResetEmail } = require('../mailer');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'kundenportal-geheimschluessel-2024';

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-Mail und Passwort sind erforderlich' });
  }
  const customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email.toLowerCase().trim());
  if (!customer || !bcrypt.compareSync(password, customer.password_hash)) {
    return res.status(401).json({ error: 'Ungültige E-Mail-Adresse oder Passwort' });
  }

  db.prepare(`INSERT INTO activity_log (customer_id, event_type, description) VALUES (?, 'login', 'Kunde hat sich angemeldet')`).run(customer.id);

  const payload = { id: customer.id, name: customer.name, email: customer.email, company: customer.company };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: payload });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email?.trim()) return res.status(400).json({ error: 'E-Mail-Adresse erforderlich' });

  const customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email.toLowerCase().trim());
  // Always respond with success to avoid email enumeration
  if (!customer) return res.json({ success: true });

  // Invalidate old tokens
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE customer_id = ? AND used = 0').run(customer.id);

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
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
  if (!token || !password || password.length < 8) {
    return res.status(400).json({ error: 'Ungültige Anfrage. Passwort muss mindestens 8 Zeichen lang sein.' });
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
