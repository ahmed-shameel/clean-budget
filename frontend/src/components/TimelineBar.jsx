import { useT } from '../i18n/index.jsx';
import SurfaceCard from './SurfaceCard';

export default function TimelineBar({ days = [] }) {
  const { t } = useT();
  const maxAmount = Math.max(
    1,
    ...days.map((d) => Math.max(Number(d.income || 0), Number(d.spent || 0), Number(d.expenses || 0)))
  );

  return (
    <SurfaceCard padding="p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{t('timeline_title')}</h3>
      <p className="text-xs text-gray-500 mb-3">{t('timeline_legend')}</p>
      <div className="overflow-x-auto">
        <div className="flex items-end gap-1 min-w-max">
          {days.map((day) => {
            const income = Number(day.income || 0);
            const spent = Number(day.spent || day.expenses || 0);
            const hasIncome = income > 0;
            const value = hasIncome ? income : spent;
            const alpha = Math.max(0.15, Math.min(1, value / maxAmount));
            const bg = hasIncome ? `rgba(22, 163, 74, ${alpha})` : `rgba(220, 38, 38, ${alpha})`;

            return (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <div
                  title={`${day.date} · ${hasIncome ? t('timeline_tooltip_income') : t('timeline_tooltip_expenses')} ${value.toFixed(0)} · ${t('timeline_tooltip_balance')} ${Number(day.running_balance ?? day.runningBalance ?? 0).toFixed(0)}`}
                  className={`h-10 w-3 rounded-full ${day.is_negative || day.isNegative ? 'ring-1 ring-red-500' : ''}`}
                  style={{ backgroundColor: bg }}
                />
                <span className="text-[10px] text-gray-500">{day.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </SurfaceCard>
  );
}
