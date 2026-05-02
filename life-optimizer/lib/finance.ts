import { eachDayOfInterval, format } from 'date-fns';
import { prisma } from './prisma';
import type { CalendarDay, CycleOverview, DayEntry, InsightSnapshot } from './types';
import { cycleRangeFromKey } from './date';

function iso(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export async function buildCycleOverview(cycleKey: string): Promise<CycleOverview> {
  const { start, end } = cycleRangeFromKey(cycleKey);

  const [profile, fixedExpenses, transactions] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.fixedExpense.findMany(),
    prisma.transaction.findMany({
      where: {
        date: { gte: start, lte: end },
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  const salary = Number(profile?.monthlySalary || 0);
  const fixedExpensesTotal = fixedExpenses.reduce((sum: number, item: { amount: number }) => sum + Number(item.amount || 0), 0);
  const baselineBalance = salary - fixedExpensesTotal;

  const txEntries: Array<{ id: string; title: string; amount: number; date: string }> = transactions.map((tx: { id: number; title: string; amount: number; date: Date }) => ({
    id: `tx-${tx.id}`,
    title: tx.title,
    amount: Number(tx.amount),
    date: iso(tx.date),
  }));

  const days = eachDayOfInterval({ start, end });
  let runningBalance = 0;

  const calendarDays: CalendarDay[] = days.map((dayDate) => {
    const dateStr = iso(dayDate);
    const isCycleStart = dateStr === iso(start);
  const dayTransactions = txEntries.filter((entry: { date: string }) => entry.date === dateStr);
  const transactionSpent = dayTransactions.reduce((sum: number, tx: { amount: number }) => sum + tx.amount, 0);
    const dayIncome = isCycleStart ? salary : 0;
    const dayFixed = isCycleStart ? fixedExpensesTotal : 0;
    const dayExpenses = transactionSpent + dayFixed;
    const dayEntries: DayEntry[] = [
      ...(isCycleStart && salary > 0
        ? [{ id: `salary-${dateStr}`, title: 'Salary', amount: salary, type: 'income' as const, source: 'baseline' as const, date: dateStr }]
        : []),
      ...(isCycleStart && fixedExpensesTotal > 0
        ? [{ id: `fixed-${dateStr}`, title: 'Fixed expenses', amount: fixedExpensesTotal, type: 'expense' as const, source: 'baseline' as const, date: dateStr }]
        : []),
      ...dayTransactions.map((tx: { id: string; title: string; amount: number }) => ({
        id: tx.id,
        title: tx.title,
        amount: tx.amount,
        type: 'expense' as const,
        source: 'transaction' as const,
        date: dateStr,
      })),
    ];

    runningBalance += dayIncome - dayExpenses;

    return {
      date: dateStr,
      day: dayDate.getDate(),
      isCycleStart,
      income: dayIncome,
      expenses: dayExpenses,
      spent: dayExpenses,
      runningBalance,
      isNegative: runningBalance < 0,
      entries: dayEntries,
    };
  });

  return {
    cycleKey,
    cycleStart: iso(start),
    cycleEnd: iso(end),
    salary,
    fixedExpensesTotal,
    baselineBalance,
    endingBalance: calendarDays.at(-1)?.runningBalance ?? baselineBalance,
    days: calendarDays,
  };
}

export function buildInsights(overview: CycleOverview): InsightSnapshot {
  const { days, salary, fixedExpensesTotal } = overview;
  const firstNegativeDate = days.find((day) => day.isNegative)?.date ?? null;
  const variableExpenseDays = days.map((day) => ({
    ...day,
    variableSpent: day.entries
      .filter((entry) => entry.source === 'transaction' && entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0),
  }));

  const avgDailyVariable =
    variableExpenseDays.reduce((sum, day) => sum + day.variableSpent, 0) /
    Math.max(variableExpenseDays.filter((day) => day.variableSpent > 0).length, 1);

  const overspendingDays = variableExpenseDays.filter((day) => day.variableSpent > avgDailyVariable * 1.4).length;
  const fixedCostRatio = salary > 0 ? (fixedExpensesTotal / salary) * 100 : 0;

  const advice: string[] = [];
  if (firstNegativeDate) {
    advice.push(`Balance turns negative on ${firstNegativeDate}. Reduce daily spending before that date or raise baseline income.`);
  }
  if (fixedCostRatio > 60) {
    advice.push('Fixed costs are above 60% of salary. Try lowering recurring commitments to improve flexibility.');
  }
  if (overspendingDays >= 3) {
    advice.push('Multiple overspending days detected. Set a daily spending cap and log purchases earlier in the day.');
  }
  if (advice.length === 0) {
    advice.push('Your cycle is stable. Keep logging transactions daily to stay proactive.');
  }

  return {
    firstNegativeDate,
    fixedCostRatio: Number(fixedCostRatio.toFixed(1)),
    overspendingDays,
    advice,
  };
}
