const express = require('express');
const router = express.Router();
const db = require('../db/database');

const BASE_SELECT = `
  SELECT
    t.id, t.type, t.expense_kind, t.amount, t.category_id,
    t.description, t.notes, t.date, t.created_at,
    c.name  AS category,
    c.icon  AS category_icon,
    c.color AS category_color
  FROM transactions t
  LEFT JOIN categories c ON c.id = t.category_id
`;

// GET /api/transactions
router.get('/', (req, res) => {
  try {
    const { month, type } = req.query;
    const conditions = [];
    const params = [];

    if (month) {
      conditions.push("strftime('%Y-%m', t.date) = ?");
      params.push(month);
    }
    if (type) {
      conditions.push('t.type = ?');
      params.push(type);
    }

    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
    const rows = db.prepare(BASE_SELECT + where + ' ORDER BY t.date DESC, t.created_at DESC').all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions
router.post('/', (req, res) => {
  try {
    const { type, expense_kind, amount, category_id, description, notes, date } = req.body;

    if (!type || !amount || !date) {
      return res.status(400).json({ error: 'type, amount, and date are required' });
    }
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'type must be income or expense' });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }
    if (type === 'expense' && expense_kind && !['fixed', 'variable'].includes(expense_kind)) {
      return res.status(400).json({ error: 'expense_kind must be fixed or variable' });
    }

    const stmt = db.prepare(`
      INSERT INTO transactions (type, expense_kind, amount, category_id, description, notes, date)
      VALUES (@type, @expense_kind, @amount, @category_id, @description, @notes, @date)
    `);
    const info = stmt.run({
      type,
      expense_kind: type === 'expense' ? expense_kind || 'variable' : null,
      amount,
      category_id: category_id || null,
      description: description || null,
      notes: notes || null,
      date,
    });
    const created = db.prepare(BASE_SELECT + ' WHERE t.id = ?').get(info.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/transactions/:id
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { type, expense_kind, amount, category_id, description, notes, date } = req.body;

    const existing = db.prepare('SELECT id FROM transactions WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Transaction not found' });

    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'type must be income or expense' });
    }
    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }
    if (expense_kind !== undefined && expense_kind !== null && !['fixed', 'variable'].includes(expense_kind)) {
      return res.status(400).json({ error: 'expense_kind must be fixed or variable' });
    }

    const fields = [];
    const values = {};
    if (type        !== undefined) { fields.push('type = @type');               values.type        = type; }
  if (expense_kind !== undefined) { fields.push('expense_kind = @expense_kind'); values.expense_kind = expense_kind; }
    if (amount      !== undefined) { fields.push('amount = @amount');           values.amount      = amount; }
    if (category_id !== undefined) { fields.push('category_id = @category_id'); values.category_id = category_id; }
    if (description !== undefined) { fields.push('description = @description'); values.description = description; }
    if (notes       !== undefined) { fields.push('notes = @notes');             values.notes       = notes; }
    if (date        !== undefined) { fields.push('date = @date');               values.date        = date; }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    values.id = id;
    db.prepare(`UPDATE transactions SET ${fields.join(', ')} WHERE id = @id`).run(values);

    const updated = db.prepare(BASE_SELECT + ' WHERE t.id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id FROM transactions WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Transaction not found' });

    db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
