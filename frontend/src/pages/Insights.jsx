import {
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/index.jsx';
import PageHeader from '../components/PageHeader';
import SurfaceCard from '../components/SurfaceCard';

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
  const { t, formatMoney } = useT();
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
            <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}>
              {t('insights_save_per_month', { amount: formatMoney(insight.savings) })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Insights() {
  const { insights, loadingInsights } = useApp();
  const { t, formatMoney } = useT();

  if (loadingInsights) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  const cards = insights?.insights || [];
  const optimization = insights?.savingsOptimization || null;
  const scenarios = optimization?.scenarios || [];

  return (
    <div className="space-y-6">
      <PageHeader title={t('insights_title')} />

      {/* Insight cards */}
      {cards.length === 0 && !optimization ? (
        <SurfaceCard className="text-center py-16" padding="">
          <Sparkles className="mx-auto text-gray-300 mb-3" size={32} />
          <p className="text-gray-400 text-sm">{t('insights_empty')}</p>
        </SurfaceCard>
      ) : (
        <>
          {cards.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-700 mb-3">
                {t('insights_recommendations')}
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
            <SurfaceCard>
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown size={20} className="text-primary-600" />
                <h2 className="text-base font-semibold text-gray-900">
                  {t('insights_optimization_title')}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{t('insights_current_savings')}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatMoney(optimization.currentMonthlySavings)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{t('insights_potential_savings')}</p>
                  <p className="text-lg font-bold text-primary-600">
                    {formatMoney(optimization.potentialMonthlySavings)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{t('insights_yearly_projection')}</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatMoney(optimization.yearlyProjection)}
                  </p>
                </div>
              </div>

              {scenarios.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    {t('insights_what_if')}
                  </h3>
                  <div className="space-y-3">
                    {scenarios.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {t('insights_reduce_by', { category: s.category, reduction: s.reduction })}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {t('insights_scenario_detail', { monthly: formatMoney(s.monthlySavings), yearly: formatMoney(s.yearlySavings) })}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                          {t('insights_scenario_badge', { amount: formatMoney(s.monthlySavings) })}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </SurfaceCard>
          )}
        </>
      )}
    </div>
  );
}
