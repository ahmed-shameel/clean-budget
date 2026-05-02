import { NextRequest, NextResponse } from 'next/server';
import { buildCycleOverview } from '@/lib/finance';
import { currentCycleKey } from '@/lib/date';

export async function GET(req: NextRequest) {
  try {
    const cycle = req.nextUrl.searchParams.get('cycle') || currentCycleKey();
    const payload = await buildCycleOverview(cycle);
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load calendar.' },
      { status: 500 }
    );
  }
}
