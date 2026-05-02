# Life Optimizer (MVP)

Life Optimizer is a financial planning app with a custom cycle from the **27th to the 26th**.

The app separates:

1. **Profile** (planned baseline): monthly salary + fixed monthly expenses
2. **Transactions** (actual spending): daily expense entries only
3. **Overview**: cycle calendar + horizontal spending timeline

## ✅ What this MVP includes

- **Profile section**
  - Monthly salary
  - Fixed monthly expenses (name + amount)
  - Salary day fixed to 27 for this MVP

- **Balance engine (27 → 26)**
  - On cycle start (27th):
    - add salary
    - subtract all fixed expenses
  - Daily update:
    - `balance(day) = previous_balance - daily_transactions`
  - Negative days highlighted

- **Transactions section**
  - Expense-only entries
  - Fields: name, amount, date

- **Overview section**
  - Shifted cycle calendar (27th marked as *Cycle Start*)
  - Day details panel
  - Horizontal timeline bars
    - Green = income events (baseline salary)
    - Red = expenses
    - Color intensity scales with amount

- **Insights**
  - First negative day in cycle
  - Fixed-cost ratio of salary
  - Overspending trend days
  - Actionable advice

- Seeded sample data + mobile-first layout + modular components

## Tech stack

- Next.js (App Router)
- React
- Tailwind CSS
- Prisma ORM
- SQLite (MVP)

## Project structure

- `app/` — pages and API routes
- `components/` — UI modules (calendar, details, forms, insights)
- `lib/` — finance engine and utilities
- `prisma/` — schema and seed data

## Setup

```bash
cd life-optimizer
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

App runs on: `http://localhost:3000`

## Useful scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run prisma:generate
npm run prisma:migrate -- --name <migration-name>
npm run prisma:seed
```

## API endpoints

- `GET /api/calendar?cycle=YYYY-MM`
- `GET /api/day?cycle=YYYY-MM&date=YYYY-MM-DD`
- `GET /api/insights?cycle=YYYY-MM`
- `GET /api/profile`
- `POST /api/profile`
- `GET /api/transactions?cycle=YYYY-MM`
- `POST /api/transactions`
- `GET /api/fixed-expenses`
- `POST /api/fixed-expenses`
- `DELETE /api/fixed-expenses?id=<id>`

## Notes

- Cycle key `YYYY-MM` represents a cycle that **starts on YYYY-MM-27** and ends on next month day 26.
- Salary is not stored as transaction rows; it is applied as baseline event on cycle start.
- For production, switch Prisma datasource to PostgreSQL and apply migrations accordingly.
