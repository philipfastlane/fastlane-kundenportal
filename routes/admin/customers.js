const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const adminAuth = require('../../middleware/adminAuth');
const db = require('../../database');
const { sendWelcomeEmail } = require('../../mailer');

const router = express.Router();
router.use(adminAuth);

function generatePassword() {
  const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower   = 'abcdefghjkmnpqrstuvwxyz';
  const digits  = '23456789';
  const special = '!@#$%';
  const all     = upper + lower + digits + special;
  const bytes   = crypto.randomBytes(14);
  // Guarantee at least one of each required character type
  let chars = [
    upper[bytes[0]   % upper.length],
    upper[bytes[1]   % upper.length],
    digits[bytes[2]  % digits.length],
    special[bytes[3] % special.length],
  ];
  for (let i = 4; i < 14; i++) chars.push(all[bytes[i] % all.length]);
  // Fisher-Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}


router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT c.id, c.name, c.email, c.company, c.created_at,
      (SELECT COUNT(*) FROM contracts WHERE customer_id = c.id) as contract_count,
      (SELECT COUNT(*) FROM invoices WHERE customer_id = c.id AND status != 'bezahlt') as open_invoices,
      (SELECT COUNT(*) FROM tickets WHERE customer_id = c.id AND status NOT IN ('gelöst','geschlossen')) as open_tickets
    FROM customers c ORDER BY c.name
  `).all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const c = db.prepare('SELECT id, name, email, company, created_at FROM customers WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Kunde nicht gefunden' });
  res.json(c);
});

router.post('/', (req, res) => {
  const { name, email, company } = req.body;
  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'Name und E-Mail sind erforderlich' });
  }
  if (db.prepare('SELECT id FROM customers WHERE email = ?').get(email.toLowerCase().trim())) {
    return res.status(400).json({ error: 'E-Mail-Adresse bereits vergeben' });
  }
  const generatedPassword = generatePassword();
  const hash = bcrypt.hashSync(generatedPassword, 10);
  const r = db.prepare('INSERT INTO customers (name, email, password_hash, company, must_change_password) VALUES (?, ?, ?, ?, 1)').run(
    name.trim(), email.toLowerCase().trim(), hash, company?.trim() || null
  );
  const customer = db.prepare('SELECT id, name, email, company, created_at FROM customers WHERE id = ?').get(r.lastInsertRowid);
  sendWelcomeEmail(customer, generatedPassword).catch((err) => console.error('Willkommens-E-Mail Fehler:', err.message));
  res.status(201).json({ ...customer, generatedPassword });
});

router.put('/:id', (req, res) => {
  const { name, email, company, password } = req.body;
  if (!db.prepare('SELECT id FROM customers WHERE id = ?').get(req.params.id)) {
    return res.status(404).json({ error: 'Kunde nicht gefunden' });
  }
  if (email) {
    const dup = db.prepare('SELECT id FROM customers WHERE email = ? AND id != ?').get(email.toLowerCase().trim(), req.params.id);
    if (dup) return res.status(400).json({ error: 'E-Mail-Adresse bereits vergeben' });
  }
  if (password) {
    db.prepare('UPDATE customers SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(password, 10), req.params.id);
  }
  db.prepare(`
    UPDATE customers SET
      name    = COALESCE(?, name),
      email   = COALESCE(?, email),
      company = COALESCE(?, company)
    WHERE id = ?
  `).run(name?.trim() || null, email?.toLowerCase().trim() || null, company?.trim() || null, req.params.id);
  res.json(db.prepare('SELECT id, name, email, company, created_at FROM customers WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  if (!db.prepare('SELECT id FROM customers WHERE id = ?').get(req.params.id)) {
    return res.status(404).json({ error: 'Kunde nicht gefunden' });
  }
  db.prepare('DELETE FROM ticket_replies        WHERE ticket_id IN (SELECT id FROM tickets WHERE customer_id = ?)').run(req.params.id);
  db.prepare('DELETE FROM tickets               WHERE customer_id = ?').run(req.params.id);
  db.prepare('DELETE FROM invoices              WHERE customer_id = ?').run(req.params.id);
  db.prepare('DELETE FROM contracts             WHERE customer_id = ?').run(req.params.id);
  db.prepare('DELETE FROM contacts              WHERE customer_id = ?').run(req.params.id);
  db.prepare('DELETE FROM activity_log          WHERE customer_id = ?').run(req.params.id);
  db.prepare('DELETE FROM password_reset_tokens WHERE customer_id = ?').run(req.params.id);
  db.prepare('DELETE FROM customers             WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
