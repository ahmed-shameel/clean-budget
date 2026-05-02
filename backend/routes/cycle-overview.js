const express = require('express');
const router = express.Router();
const db = require('../db/database');

function parseCycleKey(cycleKey) {
  const [year, month] = String(cycleKey || '').split('-').map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    throw new Error('cycle must be in format YYYY-MM');
  }
  return { year, month };
}

function currentCycleKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const startMonth = now.getDate() >= 27 ? m : (m === 1 ? 12 : m - 1);
  const startYear = now.getDate() >= 27 ? y : (m === 1 ? y - 1 : y);
  return `${startYear}-${String(startMonth).padStart(2, '0')}`;
}

function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function cycleRange(cycleKey) {
  const { year, month } = parseCycleKey(cycleKey);
  const start = new Date(year, month - 1, 27);
  const end = new Date(year, month, 26);
  return { start, end };
}

// GET /api/cycle-overview?cycle=YYYY-MM
router.get('/', (req, res) => {
  try {
    const cycle = req.query.cycle || currentCycleKey();
    const { start, end } = cycleRange(cycle);

    const profile = db
      .prepare('SELECT monthly_salary, salary_day FROM financial_profile WHERE id = 1')
      .get();
    const salary = Number(profile?.monthly_salary || 0);

    const fixedCosts = db.prepare('SELECT id, name, amount FROM fixed_costs').all();
    const fixedCostsTotal = fixedCosts.reduce((sum, fc) => sum + Number(fc.amount || 0), 0);

    const transactions = db.prepare(`
      SELECT id, description, amount, date, created_at
      FROM transactions
      WHERE type = 'expense'
        AND date >= ?
        AND date <= ?
      ORDER BY date ASC, created_at ASC
    `).all(toDateString(start), toDateString(end));

    const txByDate = transactions.reduce((acc, tx) => {
      const key = String(tx.date).slice(0, 10);
      if (!acc[key]) acc[key] = [];
      acc[key].push(tx);
      return acc;
    }, {});

    let runningBalance = 0;
    const days = [];
    const cur = new Date(start);

    while (cur <= end) {
      const date = toDateString(cur);
      const isCycleStart = cur.getDate() === 27 && cur.getMonth() === start.getMonth() && cur.getFullYear() === start.getFullYear();
      const txs = txByDate[date] || [];
      const txSpent = txs.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
      const income = isCycleStart ? salary : 0;
      const fixed = isCycleStart ? fixedCostsTotal : 0;
      const expenses = fixed + txSpent;
      runningBalance += income - expenses;

      days.push({
        date,
        day: cur.getDate(),
        is_cycle_start: isCycleStart,
        income,
        expenses,
        spent: expenses,
        running_balance: runningBalance,
        is_negative: runningBalance < 0,
        transactions: txs.map((tx) => ({
          id: tx.id,
          name: tx.description,
          amount: Number(tx.amount || 0),
          date: String(tx.date).slice(0, 10),
        })),
      });

      cur.setDate(cur.getDate() + 1);
    }

    const firstNegative = days.find((d) => d.is_negative)?.date || null;
    const variableSpends = days.map((d) => d.transactions.reduce((s, tx) => s + tx.amount, 0));
    const activeDays = variableSpends.filter((v) => v > 0).length || 1;
    const avgSpend = variableSpends.reduce((s, v) => s + v, 0) / activeDays;
    const overspendingDays = variableSpends.filter((v) => v > avgSpend * 1.4).length;
    const fixedCostRatio = salary > 0 ? Number(((fixedCostsTotal / salary) * 100).toFixed(1)) : 0;

    res.json({
      cycle,
      cycle_start: toDateString(start),
      cycle_end: toDateString(end),
      salary,
      fixed_costs_total: fixedCostsTotal,
      baseline_balance: salary - fixedCostsTotal,
      ending_balance: runningBalance,
      insights: {
        first_negative_date: firstNegative,
        fixed_cost_ratio: fixedCostRatio,
        overspending_days: overspendingDays,
      },
      days,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
