import { format } from 'date-fns';

export function currentCycleKey(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const cycleStart = now.getDate() >= 27
    ? new Date(year, month, 27)
    : new Date(year, month - 1, 27);
  return format(cycleStart, 'yyyy-MM');
}

export function cycleRangeFromKey(cycleKey: string) {
  const [y, m] = cycleKey.split('-').map(Number);
  const start = new Date(y, m - 1, 27);
  const end = new Date(y, m, 26);
  return { start, end };
}

export function cycleLabel(cycleKey: string) {
  const { start, end } = cycleRangeFromKey(cycleKey);
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
}
