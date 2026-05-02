const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/categories
router.get('/', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT
        c.*,
        CASE
          WHEN LOWER(c.name) LIKE '%income%' THEN 'income'
          ELSE 'expense'
        END AS type
      FROM categories c
      ORDER BY c.name
    `).all();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
