const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../database');

const router = express.Router();
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'fastlane-admin-geheimschluessel-2024';

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Nicht autorisiert' });
  try {
    req.admin = jwt.verify(auth.slice(7), ADMIN_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token ungültig' });
  }
}

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'E-Mail und Passwort erforderlich' });

  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email.toLowerCase().trim());
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: 'Ungültige Zugangsdaten' });
  }

  const token = jwt.sign(
    { id: admin.id, name: admin.name, email: admin.email, role: 'admin' },
    ADMIN_SECRET,
    { expiresIn: '12h' }
  );
  res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email } });
});

router.put('/profile', requireAdmin, (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Aktuelles und neues Passwort erforderlich' });
  }
  if (new_password.length < 8) {
    return res.status(400).json({ error: 'Neues Passwort muss mindestens 8 Zeichen lang sein' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.admin.id);
  if (!admin || !bcrypt.compareSync(current_password, admin.password_hash)) {
    return res.status(401).json({ error: 'Aktuelles Passwort ist falsch' });
  }

  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(hash, admin.id);
  res.json({ ok: true });
});

module.exports = router;
