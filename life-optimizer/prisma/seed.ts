import { PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';

const prisma = new PrismaClient();

function getCycleStart(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  if (now.getDate() >= 27) return new Date(year, month, 27);
  return new Date(year, month - 1, 27);
}

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.fixedExpense.deleteMany();
  await prisma.profile.deleteMany();

  await prisma.profile.create({
    data: {
      monthlySalary: 32000,
      salaryDay: 27,
    },
  });

  await prisma.fixedExpense.createMany({
    data: [
      { name: 'Rent', amount: 9500 },
      { name: 'Internet', amount: 499 },
      { name: 'Insurance', amount: 1200 },
      { name: 'Gym', amount: 399 },
    ],
  });

  const cycleStart = getCycleStart(new Date());

  await prisma.transaction.createMany({
    data: [
      {
        title: 'Groceries',
        amount: 920,
        date: addDays(cycleStart, 1),
      },
      {
        title: 'Fuel',
        amount: 640,
        date: addDays(cycleStart, 3),
      },
      {
        title: 'Restaurant',
        amount: 520,
        date: addDays(cycleStart, 6),
      },
      {
        title: 'Pharmacy',
        amount: 300,
        date: addDays(cycleStart, 10),
      },
      {
        title: 'Coffee & snacks',
        amount: 880,
        date: addDays(cycleStart, 14),
      },
      {
        title: 'Weekend activity',
        amount: 520,
        date: addDays(cycleStart, 18),
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
