const express = require('express');
const router = express.Router();
const db = require('../db/database');

function currentYearMonth() {
  return new Date().toISOString().slice(0, 7);
}

// GET /api/income-target?month=YYYY-MM
router.get('/', (req, res) => {
  try {
    const month = req.query.month || currentYearMonth();
    const row = db
      .prepare('SELECT month, total_income FROM monthly_income_targets WHERE month = ?')
      .get(month);

    res.json({
      month,
      total_income: row?.total_income ?? null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/income-target
router.post('/', (req, res) => {
  try {
    const { month, total_income } = req.body;
    if (!month || typeof total_income !== 'number' || total_income < 0) {
      return res
        .status(400)
        .json({ error: 'month and non-negative numeric total_income are required' });
    }

    db.prepare(`
      INSERT INTO monthly_income_targets (month, total_income, updated_at)
      VALUES (@month, @total_income, datetime('now'))
      ON CONFLICT(month) DO UPDATE SET
        total_income = excluded.total_income,
        updated_at = datetime('now')
    `).run({ month, total_income });

    const saved = db
      .prepare('SELECT month, total_income FROM monthly_income_targets WHERE month = ?')
      .get(month);

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
