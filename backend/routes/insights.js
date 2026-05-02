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

function getMonthlyTotals(month) {
  return db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
    FROM transactions
    WHERE strftime('%Y-%m', date) = ?
  `).get(month);
}

function getExpensesByCategory(month) {
  return db.prepare(`
    SELECT c.name AS category, c.color, COALESCE(SUM(t.amount), 0) AS amount
    FROM transactions t
    JOIN categories c ON c.id = t.category_id
    WHERE t.type = 'expense' AND strftime('%Y-%m', t.date) = ?
    GROUP BY t.category_id
    ORDER BY amount DESC
  `).all(month);
}

// GET /api/insights
router.get('/', (req, res) => {
  try {
    const currentMonth = currentYearMonth();
    const insights = [];

    const current = getMonthlyTotals(currentMonth);
    const netSavings = current.income - current.expenses;
    const savingsRate = current.income > 0 ? (netSavings / current.income) * 100 : 0;

    // ── Insight 1: low savings rate ────────────────────────────────────────────
    if (savingsRate < 20) {
      insights.push({
        type: 'warning',
        title: 'Low Savings Rate',
        description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of your income.`,
        savings: null,
      });
    } else {
      insights.push({
        type: 'success',
        title: 'Healthy Savings Rate',
        description: `Great job! You are saving ${savingsRate.toFixed(1)}% of your income this month.`,
        savings: null,
      });
    }

    // ── Insight 2: budget overspending ────────────────────────────────────────
    const budgets = db.prepare(`
      SELECT b.monthly_limit AS budget, c.name AS category,
             COALESCE(SUM(t.amount), 0) AS spent
      FROM budgets b
      JOIN categories c ON c.id = b.category_id
      LEFT JOIN transactions t
        ON t.category_id = b.category_id
        AND t.type = 'expense'
        AND strftime('%Y-%m', t.date) = ?
      GROUP BY b.id
    `).all(currentMonth);

    for (const b of budgets) {
      if (b.spent > b.budget) {
        insights.push({
          type: 'warning',
          title: `Over Budget: ${b.category}`,
          description: `You have spent €${b.spent.toFixed(2)} in ${b.category}, which is €${(b.spent - b.budget).toFixed(2)} over your €${b.budget.toFixed(2)} budget.`,
          savings: null,
        });
      }
    }

    // ── Insight 3: spending spike vs last 3 months avg ───────────────────────
    const prev3Months = [monthsAgo(1), monthsAgo(2), monthsAgo(3)];
    const currentCats = getExpensesByCategory(currentMonth);

    for (const cat of currentCats) {
      let totalPrev = 0;
      let monthsWithData = 0;
      for (const m of prev3Months) {
        const row = db.prepare(`
          SELECT COALESCE(SUM(t.amount), 0) AS amount
          FROM transactions t
          JOIN categories c ON c.id = t.category_id
          WHERE t.type = 'expense' AND strftime('%Y-%m', t.date) = ? AND c.name = ?
        `).get(m, cat.category);
        if (row.amount > 0) { totalPrev += row.amount; monthsWithData++; }
      }
      if (monthsWithData > 0) {
        const avg = totalPrev / monthsWithData;
        if (cat.amount > avg * 1.2 && cat.amount - avg > 20) {
          insights.push({
            type: 'warning',
            title: `Spending Spike: ${cat.category}`,
            description: `Your ${cat.category} spending (€${cat.amount.toFixed(2)}) is ${Math.round(((cat.amount - avg) / avg) * 100)}% above your 3-month average of €${avg.toFixed(2)}.`,
            savings: null,
          });
        }
      }
    }

    // ── Insight 4: subscriptions tip ─────────────────────────────────────────
    const subSpend = db.prepare(`
      SELECT COALESCE(SUM(t.amount), 0) AS total
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      WHERE t.type = 'expense' AND c.name = 'Subscriptions'
        AND strftime('%Y-%m', t.date) = ?
    `).get(currentMonth);

    if (subSpend.total > 0) {
      insights.push({
        type: 'tip',
        title: 'Review Your Subscriptions',
        description: `You are spending €${subSpend.total.toFixed(2)}/month on subscriptions. Review them regularly and cancel any you no longer use.`,
        savings: Math.round(subSpend.total * 0.3 * 100) / 100,
      });
    }

    // ── Savings optimisation ──────────────────────────────────────────────────
    const topExpenses = currentCats.slice(0, 5);
    const scenarios = topExpenses.map(cat => {
      const reduction = cat.category === 'Housing' ? 0.05 : 0.15;
      const monthlySavings = Math.round(cat.amount * reduction * 100) / 100;
      return {
        category:       cat.category,
        reduction:      Math.round(reduction * 100),
        monthlySavings,
        yearlySavings:  Math.round(monthlySavings * 12 * 100) / 100,
      };
    });

    const potentialMonthlySavings = scenarios.reduce((s, x) => s + x.monthlySavings, 0);

    res.json({
      insights,
      savingsOptimization: {
        currentMonthlySavings:   Math.max(netSavings, 0),
        potentialMonthlySavings: Math.round(potentialMonthlySavings * 100) / 100,
        yearlyProjection:        Math.round((Math.max(netSavings, 0) + potentialMonthlySavings) * 12 * 100) / 100,
        scenarios,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
