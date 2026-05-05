const express = require('express');
const auth = require('../middleware/auth');
const db = require('../database');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  const contacts = db.prepare(
    'SELECT * FROM contacts WHERE customer_id = ? ORDER BY name'
  ).all(req.user.id);
  res.json(contacts);
});

module.exports = router;
