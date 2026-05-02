import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rows = await prisma.fixedExpense.findMany({ orderBy: { createdAt: 'asc' } });
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load fixed expenses.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, amount } = body;

    if (!name || amount === undefined) {
      return NextResponse.json({ error: 'name and amount are required.' }, { status: 400 });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json({ error: 'amount must be a non-negative number.' }, { status: 400 });
    }

    const created = await prisma.fixedExpense.create({
      data: {
        name,
        amount: parsedAmount,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save fixed expense.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = Number(req.nextUrl.searchParams.get('id'));
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    await prisma.fixedExpense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete fixed expense.' },
      { status: 500 }
    );
  }
}
