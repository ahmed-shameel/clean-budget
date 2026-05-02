"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { addMonths, format, subMonths } from 'date-fns';
import { CalendarGrid } from '@/components/CalendarGrid';
import { DayDetailsPanel } from '@/components/DayDetailsPanel';
import { FormsPanel } from '@/components/FormsPanel';
import { InsightCards } from '@/components/InsightCards';
import { TimelineBar } from '@/components/TimelineBar';
import type { CalendarDay, CycleOverview } from '@/lib/types';
import { cycleLabel } from '@/lib/date';

type InsightPayload = {
  firstNegativeDate: string | null;
  fixedCostRatio: number;
  overspendingDays: number;
  advice: string[];
};

type ProfilePayload = {
  id: number | null;
  monthlySalary: number;
  salaryDay: number;
};

function shiftCycle(cycleKey: string, delta: number) {
  const [y, m] = cycleKey.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  const shifted = delta > 0 ? addMonths(d, delta) : subMonths(d, Math.abs(delta));
  return format(shifted, 'yyyy-MM');
}

export default function HomePage() {
  const [cycle, setCycle] = useState(format(new Date(), 'yyyy-MM'));
  const [overview, setOverview] = useState<CycleOverview | null>(null);
  const [insights, setInsights] = useState<InsightPayload | null>(null);
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [profileSalaryInput, setProfileSalaryInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, insRes, profileRes] = await Promise.all([
        fetch(`/api/calendar?cycle=${cycle}`),
        fetch(`/api/insights?cycle=${cycle}`),
        fetch('/api/profile'),
      ]);

      const overviewData = await overviewRes.json();
      const insData = await insRes.json();
      const profileData = await profileRes.json();

      setOverview(overviewData);
      setInsights(insData);
      setProfile(profileData);
      setProfileSalaryInput(String(profileData?.monthlySalary ?? 0));
      setSelectedDate((prev) => prev || overviewData.days?.[0]?.date || null);
    } finally {
      setLoading(false);
    }
  }, [cycle]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedDay = useMemo(
    () => overview?.days.find((day: CalendarDay) => day.date === selectedDate) || null,
    [overview?.days, selectedDate]
  );

  const saveProfile = async () => {
    const monthlySalary = Number(profileSalaryInput);
    if (!Number.isFinite(monthlySalary) || monthlySalary < 0) return;

    setSavingProfile(true);
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlySalary, salaryDay: 27 }),
      });
      await load();
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="card p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Life Optimizer</h1>
              <p className="mt-1 text-sm text-slate-600">
                Financial cycle from 27th to 26th. Profile baseline + daily expense tracking.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-ghost" onClick={() => setCycle((c) => shiftCycle(c, -1))}>Previous cycle</button>
              <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                {cycleLabel(cycle)}
              </span>
              <button className="btn-ghost" onClick={() => setCycle((c) => shiftCycle(c, 1))}>Next cycle</button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="card p-4 md:p-5">
            <h2 className="text-lg font-semibold text-slate-900">Profile (baseline)</h2>
            <p className="mt-1 text-sm text-slate-600">Set monthly salary. On each 27th: salary is added, fixed costs are subtracted.</p>

            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-slate-700">Monthly salary</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={profileSalaryInput}
                onChange={(e) => setProfileSalaryInput(e.target.value)}
              />
              <button className="btn-primary w-full" disabled={savingProfile} onClick={saveProfile}>
                {savingProfile ? 'Saving…' : 'Save profile'}
              </button>
            </div>

            {overview && (
              <div className="mt-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
                <p>Salary day: <span className="font-semibold">{profile?.salaryDay ?? 27}</span></p>
                <p>Salary: <span className="font-semibold text-green-700">{overview.salary.toFixed(0)}</span></p>
                <p>Fixed costs: <span className="font-semibold text-red-700">{overview.fixedExpensesTotal.toFixed(0)}</span></p>
                <p>Cycle baseline: <span className="font-semibold">{overview.baselineBalance.toFixed(0)}</span></p>
              </div>
            )}
          </section>

          <section className="card p-4 md:p-5">
            <h2 className="text-lg font-semibold text-slate-900">Transactions (daily expenses)</h2>
            <p className="mt-1 text-sm text-slate-600">Add only expense transactions: name, amount, date.</p>
            <div className="mt-4">
              <FormsPanel cycle={cycle} onSaved={() => void load()} />
            </div>
          </section>

          <section className="space-y-6">
            <InsightCards insights={insights} />
            <TimelineBar days={overview?.days || []} />
          </section>
        </div>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-4">
          <div className="xl:col-span-3">
            {loading || !overview ? (
              <div className="card p-6 text-sm text-slate-500">Loading overview…</div>
            ) : (
              <CalendarGrid
                cycle={overview.cycleKey}
                days={overview.days}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            )}
          </div>

          <aside className="xl:col-span-1">
            <DayDetailsPanel day={selectedDay} />
          </aside>
        </section>
      </div>
    </main>
  );
}
