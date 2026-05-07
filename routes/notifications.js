const express = require('express');
const auth = require('../middleware/auth');
const db = require('../database');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM notifications WHERE customer_id = ? ORDER BY created_at DESC LIMIT 20').all(req.user.id));
});

router.post('/read-all', (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE customer_id = ?').run(req.user.id);
  res.json({ success: true });
});

router.put('/:id/read', (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND customer_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

module.exports = router;
