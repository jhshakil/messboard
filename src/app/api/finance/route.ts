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
  const type = searchParams.get("type");

  let where: any = {};
  if (year && month) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);
    where.date = { gte: startDate, lte: endDate };
  }
  if (type) {
    where.type = type;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { member: { select: { id: true, name: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const transaction = await prisma.transaction.create({
    data: { ...body, updatedBy: session.user.id },
    include: { member: { select: { id: true, name: true } } },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "CREATE_TRANSACTION",
    entityType: "Transaction",
    entityId: transaction.id,
    newValue: transaction,
    request: req,
  });

  return NextResponse.json(transaction, { status: 201 });
}
