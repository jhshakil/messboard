import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  let where: any = {};
  if (type) where.type = type;
  if (year && month) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);
    where.date = { gte: startDate, lte: endDate };
  }

  const logs = await prisma.cleaningLog.findMany({
    where,
    include: { member: { select: { id: true, name: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const log = await prisma.cleaningLog.create({
    data: { ...body, date: new Date(body.date), updatedBy: session.user.id },
    include: { member: { select: { id: true, name: true } } },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "CREATE_CLEANING",
    entityType: "CleaningLog",
    entityId: log.id,
    newValue: log,
    request: req,
  });

  return NextResponse.json(log, { status: 201 });
}
