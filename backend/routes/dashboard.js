const express = require('express');
const router = express.Router();
const db = require('../db/database');

function currentYearMonth() {
  return new Date().toISOString().slice(0, 7);
}

function monthsAgo(n) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 7);
}

// GET /api/dashboard/summary
router.get('/summary', (req, res) => {
  try {
    const month = req.query.month || currentYearMonth();

    // Current month totals
    const totals = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS totalIncome,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpenses
      FROM transactions
      WHERE strftime('%Y-%m', date) = ?
    `).get(month);

    const netSavings = totals.totalIncome - totals.totalExpenses;
    const savingsRate = totals.totalIncome > 0
      ? Math.round((netSavings / totals.totalIncome) * 100 * 10) / 10
      : 0;

    // Category breakdown (expenses only, current month)
    const categoryBreakdown = db.prepare(`
      SELECT
        c.name  AS category,
        c.color AS color,
        c.icon  AS icon,
        COALESCE(SUM(t.amount), 0) AS amount
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      WHERE t.type = 'expense' AND strftime('%Y-%m', t.date) = ?
      GROUP BY t.category_id
      ORDER BY amount DESC
    `).all(month);

    // Monthly trend – last 6 months
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const m = monthsAgo(i);
      const row = db.prepare(`
        SELECT
          COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
        FROM transactions
        WHERE strftime('%Y-%m', date) = ?
      `).get(m);
      monthlyTrend.push({ month: m, income: row.income, expenses: row.expenses });
    }

    // Budget status for current month
    const budgets = db.prepare(`
      SELECT b.monthly_limit AS budget,
             c.name AS category,
             c.color,
             c.icon,
             COALESCE(SUM(t.amount), 0) AS spent
      FROM budgets b
      JOIN categories c ON c.id = b.category_id
      LEFT JOIN transactions t
        ON t.category_id = b.category_id
        AND t.type = 'expense'
        AND strftime('%Y-%m', t.date) = ?
      GROUP BY b.id
      ORDER BY c.name
    `).all(month);

    const budgetStatus = budgets.map(b => ({
      category:   b.category,
      color:      b.color,
      icon:       b.icon,
      budget:     b.budget,
      spent:      b.spent,
      remaining:  Math.max(b.budget - b.spent, 0),
      percentage: Math.round((b.spent / b.budget) * 100),
    }));

    res.json({
      currentMonth: {
        totalIncome:   totals.totalIncome,
        totalExpenses: totals.totalExpenses,
        savingsRate,
        netSavings,
      },
      categoryBreakdown,
      monthlyTrend,
      budgetStatus,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
