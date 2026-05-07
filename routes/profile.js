const express = require('express');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const db = require('../database');
const { validatePasswordStrength } = require('../utils/password');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  const customer = db.prepare('SELECT id, name, email, company, must_change_password, two_fa_enabled FROM customers WHERE id = ?').get(req.user.id);
  if (!customer) return res.status(404).json({ error: 'Kunde nicht gefunden' });
  res.json(customer);
});

router.put('/', (req, res) => {
  const { name, current_password, new_password } = req.body;
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.user.id);
  if (!customer) return res.status(404).json({ error: 'Kunde nicht gefunden' });

  if (new_password) {
    if (!current_password) return res.status(400).json({ error: 'Aktuelles Passwort erforderlich' });
    if (!bcrypt.compareSync(current_password, customer.password_hash)) {
      return res.status(400).json({ error: 'Aktuelles Passwort ist falsch' });
    }
    const strengthError = validatePasswordStrength(new_password);
    if (strengthError) return res.status(400).json({ error: strengthError });
    db.prepare('UPDATE customers SET password_hash = ?, must_change_password = 0 WHERE id = ?').run(bcrypt.hashSync(new_password, 10), customer.id);
  }

  if (name?.trim()) {
    db.prepare('UPDATE customers SET name = ? WHERE id = ?').run(name.trim(), customer.id);
  }

  const updated = db.prepare('SELECT id, name, email, company, must_change_password, two_fa_enabled FROM customers WHERE id = ?').get(customer.id);
  res.json(updated);
});

router.put('/2fa', (req, res) => {
  const { enabled } = req.body;
  db.prepare('UPDATE customers SET two_fa_enabled = ? WHERE id = ?').run(enabled ? 1 : 0, req.user.id);
  res.json({ two_fa_enabled: enabled ? 1 : 0 });
});

module.exports = router;
