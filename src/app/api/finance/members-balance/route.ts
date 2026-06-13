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

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const isSuperadmin = session.user.role === "SUPERADMIN";
  const members = await prisma.user.findMany({
    where: { isActive: true, ...(isSuperadmin ? {} : { role: { not: "SUPERADMIN" as any } }) },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const [meals, bazarEntries, transactions] = [
    await prisma.meal.findMany({ where: { date: { gte: startDate, lte: endDate } } }),
    await prisma.bazarEntry.findMany({ where: { date: { gte: startDate, lte: endDate } } }),
    await prisma.transaction.findMany({ where: { date: { gte: startDate, lte: endDate } } }),
  ];

  const totalMeals = meals.reduce((sum, m) => sum + m.mealCount, 0);
  const totalBazarCost = bazarEntries.reduce((sum, b) => sum + b.amount, 0);
  const mealRate = totalMeals > 0 ? totalBazarCost / totalMeals : 0;

  const balances = members.map((member) => {
    const memberMeals = meals.filter((m) => m.memberId === member.id);
    const memberTransactions = transactions.filter((t) => t.memberId === member.id);
    const totalMemberMeals = memberMeals.reduce((sum, m) => sum + m.mealCount, 0);
    const mealCost = totalMemberMeals * mealRate;
    const amountGiven = memberTransactions
      .filter((t) => t.type === TransactionType.GIVE)
      .reduce((sum, t) => sum + t.amount, 0);
    const amountTaken = memberTransactions
      .filter((t) => t.type === TransactionType.TAKE)
      .reduce((sum, t) => sum + t.amount, 0);
    const netBalance = amountGiven - mealCost - amountTaken;

    return {
      memberId: member.id,
      memberName: member.name,
      totalMeals: totalMemberMeals,
      mealCost: Math.round(mealCost * 100) / 100,
      amountGiven,
      amountTaken,
      netBalance: Math.round(netBalance * 100) / 100,
    };
  });

  return NextResponse.json(balances);
}
