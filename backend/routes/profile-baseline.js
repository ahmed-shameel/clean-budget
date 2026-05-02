const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/profile-baseline
router.get('/', (_req, res) => {
  try {
    const profile = db
      .prepare('SELECT monthly_salary, salary_day, updated_at FROM financial_profile WHERE id = 1')
      .get();

    const fixedCosts = db
      .prepare('SELECT id, name, amount, created_at FROM fixed_costs ORDER BY created_at ASC, id ASC')
      .all();

    const fixedCostsTotal = fixedCosts.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    res.json({
      monthly_salary: Number(profile?.monthly_salary || 0),
      salary_day: profile?.salary_day || 27,
      fixed_costs: fixedCosts,
      fixed_costs_total: fixedCostsTotal,
      baseline_balance: Number(profile?.monthly_salary || 0) - fixedCostsTotal,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/profile-baseline
router.post('/', (req, res) => {
  try {
    const monthlySalary = Number(req.body?.monthly_salary);
    if (!Number.isFinite(monthlySalary) || monthlySalary < 0) {
      return res.status(400).json({ error: 'monthly_salary must be a non-negative number' });
    }

    db.prepare(`
      UPDATE financial_profile
      SET monthly_salary = @monthly_salary,
          salary_day = 27,
          updated_at = datetime('now')
      WHERE id = 1
    `).run({ monthly_salary: monthlySalary });

    const updated = db
      .prepare('SELECT monthly_salary, salary_day, updated_at FROM financial_profile WHERE id = 1')
      .get();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
