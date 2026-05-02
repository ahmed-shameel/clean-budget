import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentCycleKey, cycleRangeFromKey } from '@/lib/date';

export async function GET(req: NextRequest) {
  try {
    const cycle = req.nextUrl.searchParams.get('cycle') || currentCycleKey();
    const { start, end } = cycleRangeFromKey(cycle);
    const rows = await prisma.transaction.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load transactions.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, amount, date } = body;

    if (!title || amount === undefined || !date) {
      return NextResponse.json({ error: 'title, amount and date are required.' }, { status: 400 });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number.' }, { status: 400 });
    }

    const created = await prisma.transaction.create({
      data: {
        title,
        amount: parsedAmount,
        date: new Date(date),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save transaction.' },
      { status: 500 }
    );
  }
}
