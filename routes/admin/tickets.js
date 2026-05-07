const express = require('express');
const adminAuth = require('../../middleware/adminAuth');
const db = require('../../database');
const { sendTicketReplyEmail, sendTicketStatusEmail } = require('../../mailer');

const router = express.Router();
router.use(adminAuth);

router.get('/', (req, res) => {
  res.json(db.prepare(`
    SELECT t.*, c.name as customer_name, c.company as customer_company
    FROM tickets t LEFT JOIN customers c ON t.customer_id = c.id
    ORDER BY t.created_at DESC
  `).all());
});

router.get('/:id', (req, res) => {
  const ticket = db.prepare(`
    SELECT t.*, c.name as customer_name, c.company as customer_company
    FROM tickets t LEFT JOIN customers c ON t.customer_id = c.id WHERE t.id = ?
  `).get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket nicht gefunden' });
  const replies = db.prepare('SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC').all(req.params.id);
  res.json({ ...ticket, replies });
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Ticket nicht gefunden' });
  const { status, priority } = req.body;
  db.prepare(`
    UPDATE tickets SET
      status   = COALESCE(?, status),
      priority = COALESCE(?, priority),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(status || null, priority || null, req.params.id);
  const updated = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);

  if (status && status !== existing.status) {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(existing.customer_id);
    if (customer) {
      sendTicketStatusEmail(customer, updated, status).catch((err) => console.error('Status-E-Mail Fehler:', err.message));
      db.prepare('INSERT INTO notifications (customer_id, type, title, message) VALUES (?, ?, ?, ?)').run(
        existing.customer_id, 'ticket_reply', `Ticket-Update: ${updated.title}`, `Neuer Status: ${status}`
      );
    }
  }
  res.json(updated);
});

router.post('/:id/reply', (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Nachricht erforderlich' });
  if (!db.prepare('SELECT id FROM tickets WHERE id = ?').get(req.params.id)) {
    return res.status(404).json({ error: 'Ticket nicht gefunden' });
  }
  const r = db.prepare(
    'INSERT INTO ticket_replies (ticket_id, author_type, author_name, message) VALUES (?, ?, ?, ?)'
  ).run(req.params.id, 'admin', req.admin.name, message.trim());
  db.prepare(`UPDATE tickets SET status = 'in Bearbeitung', updated_at = datetime('now') WHERE id = ? AND status = 'offen'`).run(req.params.id);

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(ticket.customer_id);
  if (customer) {
    sendTicketReplyEmail(customer, ticket, message.trim(), req.admin.name).catch((err) => console.error('Ticket-E-Mail Fehler:', err.message));
    db.prepare('INSERT INTO notifications (customer_id, type, title, message) VALUES (?, ?, ?, ?)').run(
      ticket.customer_id, 'ticket_reply', `Antwort auf: ${ticket.title}`, message.trim().substring(0, 120)
    );
  }

  res.status(201).json(db.prepare('SELECT * FROM ticket_replies WHERE id = ?').get(r.lastInsertRowid));
});

module.exports = router;
