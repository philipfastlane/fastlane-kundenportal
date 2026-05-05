const express = require('express');
const adminAuth = require('../../middleware/adminAuth');
const db = require('../../database');

const router = express.Router();
router.use(adminAuth);

router.get('/', (req, res) => {
  const limit  = parseInt(req.query.limit  || '100');
  const offset = parseInt(req.query.offset || '0');
  const type   = req.query.type || null;

  const rows = db.prepare(`
    SELECT a.*, c.name as customer_name, c.email as customer_email, c.company as customer_company
    FROM activity_log a
    LEFT JOIN customers c ON c.id = a.customer_id
    ${type ? 'WHERE a.event_type = ?' : ''}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...(type ? [type] : []), limit, offset);

  const total = db.prepare(`SELECT COUNT(*) as n FROM activity_log${type ? ' WHERE event_type = ?' : ''}`).get(...(type ? [type] : [])).n;

  res.json({ rows, total });
});

module.exports = router;
