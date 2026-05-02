const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/fixed-costs
router.get('/', (_req, res) => {
  try {
    const rows = db
      .prepare('SELECT id, name, amount, created_at FROM fixed_costs ORDER BY created_at ASC, id ASC')
      .all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fixed-costs
router.post('/', (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const amount = Number(req.body?.amount);

    if (!name) return res.status(400).json({ error: 'name is required' });
    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ error: 'amount must be a non-negative number' });
    }

    const info = db
      .prepare('INSERT INTO fixed_costs (name, amount) VALUES (@name, @amount)')
      .run({ name, amount });

    const created = db
      .prepare('SELECT id, name, amount, created_at FROM fixed_costs WHERE id = ?')
      .get(info.lastInsertRowid);

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/fixed-costs/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id FROM fixed_costs WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Fixed cost not found' });

    db.prepare('DELETE FROM fixed_costs WHERE id = ?').run(id);
    res.json({ message: 'Fixed cost deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
