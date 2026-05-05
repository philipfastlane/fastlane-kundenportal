const express = require('express');
const auth = require('../middleware/auth');
const db = require('../database');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  const invoices = db.prepare(
    'SELECT * FROM invoices WHERE customer_id = ? ORDER BY created_at DESC'
  ).all(req.user.id);
  db.prepare(`INSERT INTO activity_log (customer_id, event_type, description) VALUES (?, 'invoice_viewed', 'Rechnungen aufgerufen')`).run(req.user.id);
  res.json(invoices);
});

module.exports = router;
