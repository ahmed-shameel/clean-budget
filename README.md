# 💰 Clean Budget

A modern open-source personal finance and budgeting tool that helps you track expenses, structure budgets, and receive intelligent recommendations on how to save money and optimise your financial life.

![Dashboard](https://github.com/user-attachments/assets/96244129-80ba-4abe-b159-abdc2d57c825)

## ✨ Features

- **Expense Tracking** — Log income and expenses with category, date, and notes. Edit and delete entries.
- **Budget Manager** — Define monthly budgets per category. See real-time spending vs limit with colour-coded progress bars.
- **Financial Dashboard** — Monthly income, expenses, net savings and savings-rate overview with a category pie chart and 6-month trend line chart.
- **Smart Insights** — Rule-based engine that detects overspending, spending spikes vs 3-month averages, low savings rate, and subscription waste.
- **Savings Optimisation** — "What-if" scenarios showing how much you could save by reducing spending in each category by a target percentage.

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| Charts | Recharts |
| Icons | Lucide React |
| Dates | date-fns |
| Backend | Node.js + Express |
| Database | SQLite (via better-sqlite3) |

## 📁 Project Structure

```
clean-budget/
├── backend/
│   ├── server.js           # Express app, rate-limiting, route mounting, auto-seed
│   ├── package.json
│   ├── .env.example
│   ├── db/
│   │   ├── database.js     # SQLite schema + default categories
│   │   └── seed.js         # 3-month realistic sample transactions & budgets
│   └── routes/
│       ├── categories.js   # GET /api/categories
│       ├── transactions.js # CRUD + ?month/?type filters
│       ├── budgets.js      # GET (with spent) / POST (upsert) / DELETE
│       ├── dashboard.js    # Summary, pie data, trend, budget status
│       └── insights.js     # Smart insights + savings optimisation
└── frontend/
    ├── vite.config.js      # Proxies /api → localhost:3001
    ├── tailwind.config.js
    └── src/
        ├── App.jsx          # Sidebar + mobile bottom nav shell
        ├── api/client.js    # Fetch-based API client
        ├── context/AppContext.jsx  # Global state (React Context)
        ├── components/
        │   ├── StatCard.jsx
        │   ├── ProgressBar.jsx
        │   ├── TransactionModal.jsx
        │   └── BudgetModal.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── Transactions.jsx
            ├── Budgets.jsx
            └── Insights.jsx
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### 1. Clone the repository

```bash
git clone https://github.com/ahmed-shameel/clean-budget.git
cd clean-budget
```

### 2. Start the backend

```bash
cd backend
npm install
npm start          # production
# or
npm run dev        # with nodemon auto-restart
```

The API server starts on **http://localhost:3001**. On first launch it automatically creates the SQLite database and seeds it with ~3 months of realistic sample data.

### 3. Start the frontend

Open a new terminal tab:

```bash
cd frontend
npm install
npm run dev
```

The app is now available at **http://localhost:5173**.

> The Vite dev server proxies all `/api/*` requests to the backend, so no CORS configuration is needed during development.

### 4. Build for production

```bash
cd frontend
npm run build      # output → frontend/dist/
```

Serve `frontend/dist` with any static file server and point it at the running backend.

## 📡 API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/categories` | List all categories |
| GET | `/api/transactions?month=YYYY-MM` | List transactions (filterable by month/type) |
| POST | `/api/transactions` | Create a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| GET | `/api/budgets?month=YYYY-MM` | List budgets with current-month spending |
| POST | `/api/budgets` | Create or update a budget (upsert) |
| DELETE | `/api/budgets/:id` | Delete a budget |
| GET | `/api/dashboard/summary` | Monthly totals, pie data, trend, budget status |
| GET | `/api/insights` | Smart insights + savings optimisation scenarios |
| GET | `/api/health` | Health check |

## 🧠 Insights Engine

The rule-based insights engine runs server-side on every request and checks for:

1. **Low savings rate** — warns if savings rate < 20 %, celebrates if ≥ 20 %
2. **Budget overspending** — alerts for any category that has exceeded its monthly limit
3. **Spending spikes** — compares current month to 3-month average; flags categories > 20 % above average
4. **Subscription review** — suggests auditing subscriptions if total spend > €0
5. **What-if scenarios** — calculates monthly and yearly savings from reducing top-5 expense categories by 5–15 %

## 🌱 Seed Data

On first launch the backend inserts:

- 3 months of transactions (salary, rent, groceries, transport, subscriptions, entertainment, shopping, healthcare)
- 7 monthly budgets (Housing, Food & Dining, Transport, Entertainment, Shopping, Subscriptions, Healthcare)

Re-seeding is skipped automatically if transactions already exist. To reset, delete `backend/db/clean-budget.db` and restart the server.

## 📄 License

MIT
