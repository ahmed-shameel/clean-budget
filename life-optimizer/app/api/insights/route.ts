import { NextRequest, NextResponse } from 'next/server';
import { buildCycleOverview, buildInsights } from '@/lib/finance';
import { currentCycleKey } from '@/lib/date';

export async function GET(req: NextRequest) {
  try {
    const cycle = req.nextUrl.searchParams.get('cycle') || currentCycleKey();
    const overview = await buildCycleOverview(cycle);
    const insights = buildInsights(overview);
    return NextResponse.json({
      cycle,
      ...insights,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load insights.' },
      { status: 500 }
    );
  }
}
