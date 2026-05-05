const express = require('express');
const adminAuth = require('../../middleware/adminAuth');
const db = require('../../database');

const router = express.Router();
router.use(adminAuth);

router.get('/', (req, res) => {
  res.json(db.prepare(`
    SELECT co.*, c.name as customer_name, c.company as customer_company
    FROM contacts co LEFT JOIN customers c ON co.customer_id = c.id
    ORDER BY co.name
  `).all());
});

router.post('/', (req, res) => {
  const { customer_id, name, position, email, phone, department } = req.body;
  if (!customer_id || !name?.trim()) return res.status(400).json({ error: 'Kunde und Name sind erforderlich' });
  const r = db.prepare(
    'INSERT INTO contacts (customer_id, name, position, email, phone, department) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(customer_id, name.trim(), position?.trim() || null, email?.trim() || null, phone?.trim() || null, department?.trim() || null);
  res.status(201).json(db.prepare('SELECT * FROM contacts WHERE id = ?').get(r.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  if (!db.prepare('SELECT id FROM contacts WHERE id = ?').get(req.params.id)) {
    return res.status(404).json({ error: 'Ansprechpartner nicht gefunden' });
  }
  const { customer_id, name, position, email, phone, department } = req.body;
  db.prepare(`
    UPDATE contacts SET
      customer_id = COALESCE(?, customer_id),
      name        = COALESCE(?, name),
      position    = ?,
      email       = ?,
      phone       = ?,
      department  = ?
    WHERE id = ?
  `).run(customer_id || null, name?.trim() || null, position?.trim() || null, email?.trim() || null, phone?.trim() || null, department?.trim() || null, req.params.id);
  res.json(db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  if (db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id).changes === 0) {
    return res.status(404).json({ error: 'Ansprechpartner nicht gefunden' });
  }
  res.json({ success: true });
});

module.exports = router;
