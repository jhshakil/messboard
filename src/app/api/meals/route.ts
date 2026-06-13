import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const date = searchParams.get("date");

  let where: any = {};

  if (date) {
    where.date = new Date(date);
  } else if (year && month) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);
    where.date = { gte: startDate, lte: endDate };
  }

  const meals = await prisma.meal.findMany({
    where,
    include: { member: { select: { id: true, name: true, email: true } } },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(meals);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const meal = await prisma.meal.create({
    data: { ...body, updatedBy: session.user.id },
    include: { member: { select: { id: true, name: true, email: true } } },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "CREATE_MEAL",
    entityType: "Meal",
    entityId: meal.id,
    newValue: meal,
    request: req,
  });

  return NextResponse.json(meal, { status: 201 });
}
