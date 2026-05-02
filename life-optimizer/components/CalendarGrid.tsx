"use client";

import type { CalendarDay } from '@/lib/types';

type CalendarGridProps = {
  cycle: string;
  days: CalendarDay[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarGrid({ cycle, days, selectedDate, onSelectDate }: CalendarGridProps) {
  const [year, monthIndex] = cycle.split('-').map(Number);
  const first = new Date(year, monthIndex - 1, 27);
  const offset = (first.getDay() + 6) % 7;
  const placeholders = Array.from({ length: offset });

  return (
    <div className="card p-4 lg:p-6">
      <div className="mb-3 grid grid-cols-7 gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {WEEKDAYS.map((label) => (
          <div key={label} className="text-center">{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {placeholders.map((_, i) => (
          <div key={`placeholder-${i}`} className="h-28 rounded-xl border border-dashed border-slate-200 bg-slate-50/40" />
        ))}

        {days.map((day) => (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelectDate(day.date)}
            className={`h-28 rounded-xl border p-2 text-left transition-all ${
              selectedDate === day.date
                ? 'border-blue-500 ring-2 ring-blue-200'
                : day.isNegative
                ? 'border-red-300 bg-red-50/50 hover:bg-red-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">{day.day}</span>
              {day.isCycleStart && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  Cycle Start
                </span>
              )}
              {day.isNegative && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                  Negative
                </span>
              )}
            </div>

            <div className="mt-2 space-y-1 text-[11px] leading-tight">
              <p className="text-income">+ {day.income.toFixed(0)}</p>
              <p className="text-expense">- {day.expenses.toFixed(0)}</p>
              <p className="font-semibold text-balance">= {day.runningBalance.toFixed(0)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
