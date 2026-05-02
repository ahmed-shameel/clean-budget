const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/budgets
router.get('/', (req, res) => {
  try {
    const budgets = db.prepare(`
      SELECT b.id, b.category_id, b.monthly_limit, b.month,
             c.name AS category, c.icon, c.color
      FROM budgets b
      JOIN categories c ON c.id = b.category_id
      ORDER BY c.name
    `).all();
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/budgets  (upsert by category_id)
router.post('/', (req, res) => {
  try {
    const { category_id, monthly_limit, month } = req.body;

    if (!category_id || !monthly_limit || !month) {
      return res.status(400).json({ error: 'category_id, monthly_limit, and month are required' });
    }
    if (typeof monthly_limit !== 'number' || monthly_limit <= 0) {
      return res.status(400).json({ error: 'monthly_limit must be a positive number' });
    }

    const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    db.prepare(`
      INSERT INTO budgets (category_id, monthly_limit, month)
      VALUES (@category_id, @monthly_limit, @month)
      ON CONFLICT(category_id) DO UPDATE SET monthly_limit = @monthly_limit, month = @month
    `).run({ category_id, monthly_limit, month });

    const budget = db.prepare(`
      SELECT b.id, b.category_id, b.monthly_limit, b.month,
             c.name AS category, c.icon, c.color
      FROM budgets b
      JOIN categories c ON c.id = b.category_id
      WHERE b.category_id = ?
    `).get(category_id);

    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id FROM budgets WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Budget not found' });

    db.prepare('DELETE FROM budgets WHERE id = ?').run(id);
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
