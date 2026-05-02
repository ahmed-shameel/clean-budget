import { NextRequest, NextResponse } from 'next/server';
import { buildCycleOverview } from '@/lib/finance';
import { currentCycleKey } from '@/lib/date';

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get('date');
    const cycle = req.nextUrl.searchParams.get('cycle') || currentCycleKey();
    if (!date) {
      return NextResponse.json({ error: 'date is required in format YYYY-MM-DD' }, { status: 400 });
    }

    const overview = await buildCycleOverview(cycle);
    const day = overview.days.find((entry) => entry.date === date);

    if (!day) {
      return NextResponse.json({ error: 'Day not found in month.' }, { status: 404 });
    }

    return NextResponse.json(day);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load day details.' },
      { status: 500 }
    );
  }
}
