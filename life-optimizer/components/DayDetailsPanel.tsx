"use client";

import type { CalendarDay } from '@/lib/types';

type DayDetailsPanelProps = {
  day: CalendarDay | null;
};

export function DayDetailsPanel({ day }: DayDetailsPanelProps) {
  if (!day) {
    return (
      <div className="card p-4 lg:p-6">
        <h2 className="text-lg font-semibold">Day details</h2>
        <p className="mt-2 text-sm text-slate-500">Select a day to inspect income and expenses.</p>
      </div>
    );
  }

  return (
    <div className="card p-4 lg:p-6">
      <h2 className="text-lg font-semibold">{day.date}</h2>
      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-green-50 p-2 text-green-700">Income: {day.income.toFixed(2)}</div>
        <div className="rounded-lg bg-red-50 p-2 text-red-700">Expenses: {day.expenses.toFixed(2)}</div>
        <div className={`rounded-lg p-2 ${day.isNegative ? 'bg-red-100 text-red-800' : 'bg-blue-50 text-blue-700'}`}>
          Balance: {day.runningBalance.toFixed(2)}
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {day.entries.length === 0 && (
          <li className="text-sm text-slate-500">No transactions on this day.</li>
        )}
        {day.entries.map((entry) => (
          <li key={entry.id} className="rounded-lg border border-slate-200 p-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-slate-800">{entry.title}</span>
              <span className={entry.type === 'income' ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                {entry.type === 'income' ? '+' : '-'}{entry.amount.toFixed(2)}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {entry.type} · {entry.source}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
