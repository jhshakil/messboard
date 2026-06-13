import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { TransactionType } from "@prisma/client";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));

  if (!year || !month) {
    return NextResponse.json({ message: "Year and month are required" }, { status: 400 });
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const [meals, bazarEntries, transactions, cleaningLogs, members] = await Promise.all([
    prisma.meal.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      include: { member: { select: { id: true, name: true } } },
      orderBy: { date: "asc" },
    }),
    prisma.bazarEntry.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      include: { member: { select: { id: true, name: true } } },
      orderBy: { date: "asc" },
    }),
    prisma.transaction.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      include: { member: { select: { id: true, name: true } } },
      orderBy: { date: "asc" },
    }),
    prisma.cleaningLog.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      include: { member: { select: { id: true, name: true } } },
      orderBy: { date: "asc" },
    }),
    prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalMeals = meals.reduce((sum, m) => sum + m.mealCount, 0);
  const totalBazarCost = bazarEntries.reduce((sum, b) => sum + b.amount, 0);
  const mealRate = totalMeals > 0 ? totalBazarCost / totalMeals : 0;
  const totalGiven = transactions
    .filter((t) => t.type === TransactionType.GIVE)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalTaken = transactions
    .filter((t) => t.type === TransactionType.TAKE)
    .reduce((sum, t) => sum + t.amount, 0);

  return NextResponse.json({
    month,
    year,
    totalMeals,
    totalBazarCost,
    mealRate: Math.round(mealRate * 100) / 100,
    totalFundCollected: totalGiven,
    totalFundWithdrawn: totalTaken,
    currentBalance: totalGiven - totalBazarCost - totalTaken,
    meals,
    bazarEntries,
    transactions,
    cleaningLogs,
    members,
  });
}
