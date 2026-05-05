const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../database');

const router = express.Router();
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'fastlane-admin-geheimschluessel-2024';

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

module.exports = router;
