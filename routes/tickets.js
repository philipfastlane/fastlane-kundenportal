const express = require('express');
const auth = require('../middleware/auth');
const db = require('../database');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  const tickets = db.prepare(
    'SELECT * FROM tickets WHERE customer_id = ? ORDER BY created_at DESC'
  ).all(req.user.id);
  res.json(tickets);
});

router.post('/', (req, res) => {
  const { title, description, priority } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'Betreff ist erforderlich' });
  if (!description || !description.trim()) return res.status(400).json({ error: 'Beschreibung ist erforderlich' });

  const result = db.prepare(
    'INSERT INTO tickets (customer_id, title, description, priority) VALUES (?, ?, ?, ?)'
  ).run(req.user.id, title.trim(), description.trim(), priority || 'mittel');

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(result.lastInsertRowid);
  db.prepare(`INSERT INTO activity_log (customer_id, event_type, description) VALUES (?, 'ticket_created', ?)`).run(req.user.id, `Ticket erstellt: "${ticket.title}"`);

  res.status(201).json(ticket);
});

module.exports = router;
