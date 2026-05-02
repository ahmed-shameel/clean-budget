const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/profiles
router.get('/', (_req, res) => {
  try {
    const profiles = db.prepare(`
      SELECT p.*, COUNT(pb.id) AS budget_count
      FROM budget_profiles p
      LEFT JOIN profile_budgets pb ON pb.profile_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `).all();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/profiles — create profile (optionally with budgets)
router.post('/', (req, res) => {
  const { name, budgets } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  try {
    const result = db.prepare('INSERT INTO budget_profiles (name) VALUES (?)').run(name.trim());
    const profileId = result.lastInsertRowid;

    if (Array.isArray(budgets) && budgets.length > 0) {
      const upsert = db.prepare(`
        INSERT INTO profile_budgets (profile_id, category_id, monthly_limit)
        VALUES (?, ?, ?)
        ON CONFLICT(profile_id, category_id) DO UPDATE SET monthly_limit = excluded.monthly_limit
      `);
      const insertAll = db.transaction(() => {
        for (const b of budgets) {
          if (b.category_id && b.monthly_limit > 0) {
            upsert.run(profileId, b.category_id, b.monthly_limit);
          }
        }
      });
      insertAll();
    }

    res.status(201).json({ id: profileId, name: name.trim() });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Profile name already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/profiles/:id — update name + replace budgets
router.put('/:id', (req, res) => {
  const { name, budgets } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  try {
    db.prepare('UPDATE budget_profiles SET name = ? WHERE id = ?').run(name.trim(), req.params.id);

    if (Array.isArray(budgets)) {
      db.prepare('DELETE FROM profile_budgets WHERE profile_id = ?').run(req.params.id);
      const insert = db.prepare(`
        INSERT INTO profile_budgets (profile_id, category_id, monthly_limit)
        VALUES (?, ?, ?)
      `);
      const insertAll = db.transaction(() => {
        for (const b of budgets) {
          if (b.category_id && b.monthly_limit > 0) {
            insert.run(req.params.id, b.category_id, b.monthly_limit);
          }
        }
      });
      insertAll();
    }

    res.json({ ok: true });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Profile name already exists' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/profiles/:id
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM budget_profiles WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/profiles/:id/budgets
router.get('/:id/budgets', (req, res) => {
  try {
    const budgets = db.prepare(`
      SELECT pb.id, pb.profile_id, pb.category_id, pb.monthly_limit,
             c.name AS category_name, c.icon, c.color
      FROM profile_budgets pb
      JOIN categories c ON c.id = pb.category_id
      WHERE pb.profile_id = ?
      ORDER BY c.name
    `).all(req.params.id);
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/profiles/:id/apply — copy profile budgets to active budgets for a month
router.post('/:id/apply', (req, res) => {
  const { month } = req.body;
  if (!month) return res.status(400).json({ error: 'month is required' });

  try {
    const profileBudgets = db.prepare('SELECT * FROM profile_budgets WHERE profile_id = ?').all(req.params.id);
    if (profileBudgets.length === 0) return res.status(400).json({ error: 'Profile has no budgets' });

    const upsert = db.prepare(`
      INSERT INTO budgets (category_id, monthly_limit, month)
      VALUES (@category_id, @monthly_limit, @month)
      ON CONFLICT(category_id) DO UPDATE SET monthly_limit = @monthly_limit, month = @month
    `);
    const applyAll = db.transaction(() => {
      for (const pb of profileBudgets) {
        upsert.run({ category_id: pb.category_id, monthly_limit: pb.monthly_limit, month });
      }
    });
    applyAll();

    res.json({ ok: true, applied: profileBudgets.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
