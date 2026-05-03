import { useMemo, useState } from 'react';
import { parseISO, format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/index.jsx';
import TimelineBar from '../components/TimelineBar';
import PageHeader from '../components/PageHeader';
import SurfaceCard from '../components/SurfaceCard';
import { CYCLE_START_DAY } from '../constants/app';

export default function Dashboard() {
  const { cycleOverview, loadingCycleOverview } = useApp();
  const { t, formatMoney } = useT();
  const [selectedDate, setSelectedDate] = useState(null);

  const days = useMemo(() => cycleOverview?.days || [], [cycleOverview?.days]);
  const today = format(new Date(), 'yyyy-MM-dd');
  const activeDate = selectedDate && days.some((d) => d.date === selectedDate)
    ? selectedDate
    : days.some((d) => d.date === today)
    ? today
    : days[0]?.date || null;

  const selectedDay = useMemo(
    () => days.find((d) => d.date === activeDate) || days[0] || null,
    [days, activeDate]
  );

  if (loadingCycleOverview) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('overview_title')} />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500">{t('profile_monthly_salary')}</p>
          <p className="text-lg font-semibold text-green-700">{formatMoney(cycleOverview?.salary || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500">{t('profile_fixed_total')}</p>
          <p className="text-lg font-semibold text-red-700">{formatMoney(cycleOverview?.fixed_costs_total || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500">{t('profile_baseline_balance')}</p>
          <p className="text-lg font-semibold text-gray-900">{formatMoney(cycleOverview?.baseline_balance || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500">{t('overview_ending_balance')}</p>
          <p className={`text-lg font-semibold ${(cycleOverview?.ending_balance || 0) < 0 ? 'text-red-700' : 'text-gray-900'}`}>
            {formatMoney(cycleOverview?.ending_balance || 0)}
          </p>
        </div>
      </div>

      <TimelineBar days={days} />

      <SurfaceCard>
        <h2 className="text-base font-semibold text-gray-900 mb-4">{t('overview_cycle_calendar')}</h2>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => (
            <button
              key={d.date}
              onClick={() => setSelectedDate(d.date)}
              className={`text-left rounded-lg border p-2 min-h-[84px] ${
                d.is_negative ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
              } ${selectedDay?.date === d.date ? 'ring-2 ring-primary-200 border-primary-400' : ''}`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                <span>{d.day}</span>
                {d.is_cycle_start && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px]">{CYCLE_START_DAY}</span>
                )}
              </div>
              <p className="text-[11px] text-red-600 mt-1">-{formatMoney(d.spent || d.expenses || 0)}</p>
              <p className="text-[11px] text-gray-700">{formatMoney(d.running_balance ?? d.runningBalance ?? 0)}</p>
            </button>
          ))}
        </div>
      </SurfaceCard>

      {selectedDay && (
        <SurfaceCard>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            {format(parseISO(selectedDay.date), 'MMM d, yyyy')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-4">
            <div className="rounded-lg bg-green-50 text-green-700 p-3">+ {formatMoney(selectedDay.income || 0)}</div>
            <div className="rounded-lg bg-red-50 text-red-700 p-3">- {formatMoney(selectedDay.spent || selectedDay.expenses || 0)}</div>
            <div className={`rounded-lg p-3 ${(selectedDay.is_negative || selectedDay.isNegative) ? 'bg-red-100 text-red-800' : 'bg-blue-50 text-blue-700'}`}>
              {formatMoney(selectedDay.running_balance ?? selectedDay.runningBalance ?? 0)}
            </div>
          </div>
          <ul className="space-y-2">
            {(selectedDay.transactions || []).map((tx) => (
              <li key={tx.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm">
                <span>{tx.name}</span>
                <span className="font-semibold text-red-600">-{formatMoney(tx.amount)}</span>
              </li>
            ))}
            {(selectedDay.transactions || []).length === 0 && (
              <li className="text-sm text-gray-400">{t('transactions_empty')}</li>
            )}
          </ul>
        </SurfaceCard>
      )}

      {cycleOverview?.insights && (
        <SurfaceCard>
          <h2 className="text-base font-semibold text-gray-900 mb-4">{t('insights_title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-gray-500">{t('overview_first_negative')}</p>
              <p className="font-semibold">{cycleOverview.insights.first_negative_date || '-'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-gray-500">{t('overview_fixed_ratio')}</p>
              <p className="font-semibold">{cycleOverview.insights.fixed_cost_ratio}%</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-gray-500">{t('overview_overspending_days')}</p>
              <p className="font-semibold">{cycleOverview.insights.overspending_days}</p>
            </div>
          </div>
        </SurfaceCard>
      )}
    </div>
  );
}
