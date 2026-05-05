const express = require('express');
const auth = require('../middleware/auth');
const db = require('../database');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  const contracts = db.prepare(
    'SELECT * FROM contracts WHERE customer_id = ? ORDER BY id DESC'
  ).all(req.user.id);
  res.json(contracts);
});

module.exports = router;
