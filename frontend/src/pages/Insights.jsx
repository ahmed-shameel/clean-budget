import {
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const fmt = (v) =>
  `€${Number(v || 0).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CARD_STYLES = {
  warning: {
    bg: 'bg-red-50 border border-red-100',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    badge: 'bg-red-100 text-red-700',
  },
  tip: {
    bg: 'bg-blue-50 border border-blue-100',
    icon: Lightbulb,
    iconColor: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-700',
  },
  success: {
    bg: 'bg-green-50 border border-green-100',
    icon: CheckCircle,
    iconColor: 'text-green-500',
    badge: 'bg-green-100 text-green-700',
  },
};

function InsightCard({ insight }) {
  const type = insight.type || 'tip';
  const style = CARD_STYLES[type] || CARD_STYLES.tip;
  const Icon = style.icon;

  return (
    <div className={`rounded-xl p-5 ${style.bg}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex-shrink-0 ${style.iconColor}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{insight.title}</h3>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            {insight.description}
          </p>
          {insight.savings != null && (
            <span
              className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}
            >
              Save {fmt(insight.savings)}/month
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Insights() {
  const { insights, loadingInsights } = useApp();

  if (loadingInsights) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  const cards = insights?.insights || [];
  const optimization = insights?.savingsOptimization || null;
  const scenarios = insights?.whatIfScenarios || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Insights</h1>

      {/* Insight cards */}
      {cards.length === 0 && !optimization ? (
        <div className="bg-white rounded-xl shadow-sm text-center py-16">
          <Sparkles className="mx-auto text-gray-300 mb-3" size={32} />
          <p className="text-gray-400 text-sm">
            Add more transactions to unlock insights.
          </p>
        </div>
      ) : (
        <>
          {cards.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-700 mb-3">
                Recommendations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map((insight, i) => (
                  <InsightCard key={i} insight={insight} />
                ))}
              </div>
            </div>
          )}

          {/* Savings Optimization */}
          {optimization && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown size={20} className="text-primary-600" />
                <h2 className="text-base font-semibold text-gray-900">
                  Savings Optimization
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Current Monthly Savings</p>
                  <p className="text-lg font-bold text-gray-900">
                    {fmt(optimization.currentSavings)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Potential Monthly Savings</p>
                  <p className="text-lg font-bold text-primary-600">
                    {fmt(optimization.potentialSavings)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Yearly Projection</p>
                  <p className="text-lg font-bold text-green-600">
                    {fmt((optimization.potentialSavings || 0) * 12)}
                  </p>
                </div>
              </div>

              {scenarios.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    What-If Scenarios
                  </h3>
                  <div className="space-y-3">
                    {scenarios.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Reduce{' '}
                            <span className="text-primary-600">{s.category}</span> by{' '}
                            {s.reductionPercent}%
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {fmt(s.monthlySaving)}/month · {fmt(s.yearlySaving)}/year
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                          +{fmt(s.monthlySaving)}/mo
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
