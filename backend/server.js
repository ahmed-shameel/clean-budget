require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const categoriesRouter    = require('./routes/categories');
const transactionsRouter  = require('./routes/transactions');
const budgetsRouter       = require('./routes/budgets');
const dashboardRouter     = require('./routes/dashboard');
const insightsRouter      = require('./routes/insights');
const profilesRouter      = require('./routes/profiles');
const resetRouter         = require('./routes/reset');
const { seed }            = require('./db/seed');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rate limiting: 300 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', apiLimiter);

// Seed on first startup
seed();

// Routes
app.use('/api/categories',   categoriesRouter);
app.use('/api/transactions',  transactionsRouter);
app.use('/api/budgets',       budgetsRouter);
app.use('/api/dashboard',     dashboardRouter);
app.use('/api/insights',      insightsRouter);
app.use('/api/profiles',      profilesRouter);
app.use('/api/reset',         resetRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`🚀 Clean Budget API running on http://localhost:${PORT}`);
});

module.exports = app;
