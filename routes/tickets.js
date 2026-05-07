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

router.get('/:id', (req, res) => {
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ? AND customer_id = ?').get(req.params.id, req.user.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket nicht gefunden' });
  const replies = db.prepare('SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC').all(req.params.id);
  res.json({ ...ticket, replies });
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

router.post('/:id/reply', (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Nachricht erforderlich' });
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ? AND customer_id = ?').get(req.params.id, req.user.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket nicht gefunden' });
  const customer = db.prepare('SELECT name FROM customers WHERE id = ?').get(req.user.id);
  const r = db.prepare('INSERT INTO ticket_replies (ticket_id, author_type, author_name, message) VALUES (?, ?, ?, ?)').run(
    req.params.id, 'customer', customer.name, message.trim()
  );
  db.prepare(`UPDATE tickets SET updated_at = datetime('now') WHERE id = ?`).run(req.params.id);
  res.status(201).json(db.prepare('SELECT * FROM ticket_replies WHERE id = ?').get(r.lastInsertRowid));
});

module.exports = router;
