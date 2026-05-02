"use client";

import type { CalendarDay } from '@/lib/types';

type TimelineBarProps = {
  days: CalendarDay[];
};

function scaleIntensity(value: number, max: number) {
  if (max <= 0) return 0.15;
  return Math.max(0.15, Math.min(1, value / max));
}

export function TimelineBar({ days }: TimelineBarProps) {
  const maxSpent = Math.max(...days.map((d) => d.spent), 1);
  const maxIncome = Math.max(...days.map((d) => d.income), 1);

  return (
    <div className="card p-4">
      <h2 className="text-lg font-semibold">Spending timeline</h2>
      <p className="mt-1 text-sm text-slate-600">Horizontal cycle map. Green = income events, red = expenses. Darker means larger amount.</p>

      <div className="mt-4 overflow-x-auto">
        <div className="flex min-w-max items-center gap-1">
          {days.map((day) => {
            const hasIncome = day.income > 0;
            const intensity = hasIncome
              ? scaleIntensity(day.income, maxIncome)
              : scaleIntensity(day.spent, maxSpent);

            const baseColor = hasIncome ? '22, 163, 74' : '220, 38, 38';
            const bg = `rgba(${baseColor}, ${intensity})`;

            return (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <div
                  title={`${day.date} | spent: ${day.spent.toFixed(0)} | balance: ${day.runningBalance.toFixed(0)}`}
                  className={`h-10 w-3 rounded-full ${day.isNegative ? 'ring-1 ring-red-500' : ''}`}
                  style={{ backgroundColor: bg }}
                />
                <span className="text-[10px] text-slate-500">{day.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
