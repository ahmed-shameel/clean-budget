"use client";

type InsightPayload = {
  firstNegativeDate: string | null;
  fixedCostRatio: number;
  overspendingDays: number;
  advice: string[];
};

export function InsightCards({ insights }: { insights: InsightPayload | null }) {
  if (!insights) {
    return (
      <div className="card p-4">
        <p className="text-sm text-slate-500">Loading insights…</p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h2 className="text-lg font-semibold">Financial insights</h2>
      <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-slate-500">Negative day</p>
          <p className="font-semibold">{insights.firstNegativeDate || 'No negative day'}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-slate-500">Fixed cost ratio</p>
          <p className="font-semibold">{insights.fixedCostRatio}%</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-slate-500">Overspending days</p>
          <p className="font-semibold">{insights.overspendingDays}</p>
        </div>
      </div>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {insights.advice.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </div>
  );
}
