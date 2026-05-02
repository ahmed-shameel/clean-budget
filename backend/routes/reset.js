const express = require('express');
const router = express.Router();
const db = require('../db/database');

// POST /api/reset — wipe all transactions and active budgets
router.post('/', (_req, res) => {
  try {
    db.transaction(() => {
      db.prepare('DELETE FROM transactions').run();
      db.prepare('DELETE FROM budgets').run();
    })();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
