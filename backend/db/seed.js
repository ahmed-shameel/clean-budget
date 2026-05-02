const db = require('./database');

function monthsAgo(n) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 7); // YYYY-MM
}

function dateInMonth(yearMonth, day) {
  return `${yearMonth}-${String(day).padStart(2, '0')}`;
}

function randomBetween(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function getCategoryId(name) {
  const row = db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
  if (!row) throw new Error(`Category not found: ${name}`);
  return row.id;
}

function seed() {
  const existing = db.prepare('SELECT COUNT(*) as cnt FROM transactions').get();
  if (existing.cnt > 0) return; // already seeded

  const insert = db.prepare(`
    INSERT INTO transactions (type, amount, category_id, description, notes, date)
    VALUES (@type, @amount, @category_id, @description, @notes, @date)
  `);

  const insertBudget = db.prepare(`
    INSERT OR REPLACE INTO budgets (category_id, monthly_limit, month)
    VALUES (@category_id, @monthly_limit, @month)
  `);

  const currentMonth = monthsAgo(0);

  const seededData = db.transaction(() => {
    for (let mIdx = 0; mIdx <= 2; mIdx++) {
      const month = monthsAgo(mIdx);

      // Salary income
      insert.run({
        type: 'income',
        amount: randomBetween(3400, 3600),
        category_id: getCategoryId('Income'),
        description: 'Monthly Salary',
        notes: null,
        date: dateInMonth(month, 1),
      });

      // Rent
      insert.run({
        type: 'expense',
        amount: 1200,
        category_id: getCategoryId('Housing'),
        description: 'Rent',
        notes: null,
        date: dateInMonth(month, 3),
      });

      // Food & Dining – several entries
      const foodItems = [
        { description: 'Weekly groceries', amount: randomBetween(60, 90) },
        { description: 'Weekly groceries', amount: randomBetween(60, 90) },
        { description: 'Weekly groceries', amount: randomBetween(60, 90) },
        { description: 'Weekly groceries', amount: randomBetween(60, 90) },
        { description: 'Restaurant dinner', amount: randomBetween(30, 60) },
        { description: 'Coffee & snacks',   amount: randomBetween(15, 35) },
        { description: 'Takeaway',          amount: randomBetween(20, 40) },
      ];
      for (const [i, item] of foodItems.entries()) {
        insert.run({
          type: 'expense',
          amount: item.amount,
          category_id: getCategoryId('Food & Dining'),
          description: item.description,
          notes: null,
          date: dateInMonth(month, 4 + i * 4),
        });
      }

      // Transport
      insert.run({
        type: 'expense',
        amount: randomBetween(40, 70),
        category_id: getCategoryId('Transport'),
        description: 'Monthly transit pass',
        notes: null,
        date: dateInMonth(month, 2),
      });
      insert.run({
        type: 'expense',
        amount: randomBetween(30, 60),
        category_id: getCategoryId('Transport'),
        description: 'Fuel',
        notes: null,
        date: dateInMonth(month, 14),
      });

      // Subscriptions
      insert.run({
        type: 'expense',
        amount: 15.99,
        category_id: getCategoryId('Subscriptions'),
        description: 'Netflix',
        notes: null,
        date: dateInMonth(month, 5),
      });
      insert.run({
        type: 'expense',
        amount: 9.99,
        category_id: getCategoryId('Subscriptions'),
        description: 'Spotify',
        notes: null,
        date: dateInMonth(month, 5),
      });
      insert.run({
        type: 'expense',
        amount: 9.99,
        category_id: getCategoryId('Subscriptions'),
        description: 'iCloud Storage',
        notes: null,
        date: dateInMonth(month, 6),
      });

      // Entertainment
      insert.run({
        type: 'expense',
        amount: randomBetween(20, 50),
        category_id: getCategoryId('Entertainment'),
        description: 'Cinema tickets',
        notes: null,
        date: dateInMonth(month, 10),
      });
      insert.run({
        type: 'expense',
        amount: randomBetween(30, 80),
        category_id: getCategoryId('Entertainment'),
        description: 'Concert / event',
        notes: null,
        date: dateInMonth(month, 20),
      });

      // Shopping
      insert.run({
        type: 'expense',
        amount: randomBetween(50, 150),
        category_id: getCategoryId('Shopping'),
        description: 'Clothing',
        notes: null,
        date: dateInMonth(month, 12),
      });
      insert.run({
        type: 'expense',
        amount: randomBetween(30, 80),
        category_id: getCategoryId('Shopping'),
        description: 'Household items',
        notes: null,
        date: dateInMonth(month, 18),
      });

      // Healthcare – occasional
      if (mIdx !== 1) {
        insert.run({
          type: 'expense',
          amount: randomBetween(20, 80),
          category_id: getCategoryId('Healthcare'),
          description: 'Pharmacy / doctor',
          notes: null,
          date: dateInMonth(month, 22),
        });
      }
    }

    // Budgets for current month
    const budgets = [
      { name: 'Housing',       monthly_limit: 1300 },
      { name: 'Food & Dining', monthly_limit: 450  },
      { name: 'Transport',     monthly_limit: 150  },
      { name: 'Entertainment', monthly_limit: 150  },
      { name: 'Shopping',      monthly_limit: 200  },
      { name: 'Subscriptions', monthly_limit: 50   },
      { name: 'Healthcare',    monthly_limit: 100  },
    ];
    for (const b of budgets) {
      insertBudget.run({
        category_id: getCategoryId(b.name),
        monthly_limit: b.monthly_limit,
        month: currentMonth,
      });
    }
  });

  seededData();
  console.log('✅ Database seeded with sample data');
}

module.exports = { seed };
