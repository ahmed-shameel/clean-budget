export type DayEntry = {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  source: 'baseline' | 'transaction';
  date: string;
};

export type CalendarDay = {
  date: string;
  day: number;
  isCycleStart: boolean;
  income: number;
  expenses: number;
  spent: number;
  runningBalance: number;
  isNegative: boolean;
  entries: DayEntry[];
};

export type InsightSnapshot = {
  firstNegativeDate: string | null;
  fixedCostRatio: number;
  overspendingDays: number;
  advice: string[];
};

export type CycleOverview = {
  cycleKey: string;
  cycleStart: string;
  cycleEnd: string;
  salary: number;
  fixedExpensesTotal: number;
  baselineBalance: number;
  endingBalance: number;
  days: CalendarDay[];
};
