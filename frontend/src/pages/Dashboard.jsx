import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, PiggyBank, Percent } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/index.jsx';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';

const FALLBACK_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const { dashboardData, loadingDashboard } = useApp();
  const { t, formatMoney } = useT();

  if (loadingDashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  const summary = dashboardData?.currentMonth || {};
  const pieData = dashboardData?.categoryBreakdown || [];
  const trendData = dashboardData?.monthlyTrend || [];
  const budgetStatus = dashboardData?.budgetStatus || [];

  const income = summary.totalIncome || 0;
  const expenses = summary.totalExpenses || 0;
  const net = income - expenses;
  const savingsRate = income > 0 ? ((net / income) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('dashboard_title')}</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard_total_income')}
          value={formatMoney(income)}
          icon={TrendingUp}
          color="green"
          subtitle={t('dashboard_this_month')}
        />
        <StatCard
          title={t('dashboard_total_expenses')}
          value={formatMoney(expenses)}
          icon={TrendingDown}
          color="red"
          subtitle={t('dashboard_this_month')}
        />
        <StatCard
          title={t('dashboard_net_savings')}
          value={formatMoney(net)}
          icon={PiggyBank}
          color={net >= 0 ? 'blue' : 'red'}
          subtitle={t('dashboard_income_minus_expenses')}
        />
        <StatCard
          title={t('dashboard_savings_rate')}
          value={`${savingsRate}%`}
          icon={Percent}
          color="purple"
          subtitle={t('dashboard_of_total_income')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            {t('dashboard_expense_breakdown')}
          </h2>
          {pieData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">
              {t('dashboard_no_expense_data')}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="amount"
                  nameKey="category"
                >
                  {pieData.map((entry, i) => (
                    <Cell
                      key={entry.category}
                      fill={entry.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatMoney(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Line chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            {t('dashboard_income_vs_expenses')}
          </h2>
          {trendData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">
              {t('dashboard_no_trend_data')}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatMoney(v)} />
                <Tooltip formatter={(v) => formatMoney(v)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name={t('dashboard_income_label')}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name={t('dashboard_expenses_label')}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Budget status */}
      {budgetStatus.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            {t('dashboard_budget_status')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetStatus.map((b) => {
              const pct = b.percentage || 0;
              const statusColor =
                pct >= 100
                  ? 'text-red-600'
                  : pct >= 80
                  ? 'text-yellow-600'
                  : 'text-green-600';
              return (
                <div key={b.category} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {b.icon} {b.category}
                    </span>
                    <span className={`text-sm font-semibold ${statusColor}`}>
                      {pct}%
                    </span>
                  </div>
                  <ProgressBar percent={pct} />
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>{formatMoney(b.spent)} {t('budgets_spent')}</span>
                    <span>{formatMoney(b.budget)} {t('budget_monthly_limit')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
