const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'clean-budget.db');
const db = new Database(DB_PATH);

// Enable WAL mode and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    color TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    expense_kind TEXT CHECK(expense_kind IN ('fixed', 'variable')),
    amount REAL NOT NULL,
    category_id INTEGER,
    description TEXT,
    notes TEXT,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL UNIQUE,
    monthly_limit REAL NOT NULL,
    month TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS budget_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS profile_budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    monthly_limit REAL NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES budget_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    UNIQUE(profile_id, category_id)
  );

  CREATE TABLE IF NOT EXISTS monthly_income_targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL UNIQUE,
    total_income REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS financial_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    monthly_salary REAL NOT NULL DEFAULT 0,
    salary_day INTEGER NOT NULL DEFAULT 27 CHECK (salary_day = 27),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS fixed_costs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount >= 0),
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

const transactionColumns = db
  .prepare("PRAGMA table_info('transactions')")
  .all()
  .map((c) => c.name);

if (!transactionColumns.includes('expense_kind')) {
  db.exec("ALTER TABLE transactions ADD COLUMN expense_kind TEXT CHECK(expense_kind IN ('fixed', 'variable'))");
}

db.prepare(`
  INSERT OR IGNORE INTO financial_profile (id, monthly_salary, salary_day)
  VALUES (1, 0, 27)
`).run();

const DEFAULT_CATEGORIES = [
  { name: 'Housing',        icon: '🏠', color: '#6366f1' },
  { name: 'Food & Dining',  icon: '🍽️', color: '#f59e0b' },
  { name: 'Transport',      icon: '🚗', color: '#3b82f6' },
  { name: 'Entertainment',  icon: '🎬', color: '#ec4899' },
  { name: 'Healthcare',     icon: '💊', color: '#10b981' },
  { name: 'Shopping',       icon: '🛍️', color: '#8b5cf6' },
  { name: 'Subscriptions',  icon: '📱', color: '#06b6d4' },
  { name: 'Education',      icon: '📚', color: '#f97316' },
  { name: 'Travel',         icon: '✈️', color: '#84cc16' },
  { name: 'Income',         icon: '💰', color: '#22c55e' },
  { name: 'Other',          icon: '📦', color: '#94a3b8' },
];

const insertCategory = db.prepare(
  'INSERT OR IGNORE INTO categories (name, icon, color) VALUES (@name, @icon, @color)'
);
const seedCategories = db.transaction(() => {
  for (const cat of DEFAULT_CATEGORIES) insertCategory.run(cat);
});
seedCategories();

module.exports = db;
