import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    return NextResponse.json(
      profile || { id: null, monthlySalary: 0, salaryDay: 27 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load profile.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const monthlySalary = Number(body?.monthlySalary);
    const salaryDay = Number(body?.salaryDay || 27);

    if (!Number.isFinite(monthlySalary) || monthlySalary < 0) {
      return NextResponse.json(
        { error: 'monthlySalary must be a non-negative number.' },
        { status: 400 }
      );
    }

    if (salaryDay !== 27) {
      return NextResponse.json(
        { error: 'salaryDay is fixed to 27 in this MVP.' },
        { status: 400 }
      );
    }

    const existing = await prisma.profile.findFirst();

    const saved = existing
      ? await prisma.profile.update({
          where: { id: existing.id },
          data: { monthlySalary, salaryDay: 27 },
        })
      : await prisma.profile.create({
          data: { monthlySalary, salaryDay: 27 },
        });

    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save profile.' },
      { status: 500 }
    );
  }
}
