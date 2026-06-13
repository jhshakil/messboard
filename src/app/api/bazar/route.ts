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

  let where: any = {};
  if (year && month) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);
    where.date = { gte: startDate, lte: endDate };
  }

  const entries = await prisma.bazarEntry.findMany({
    where,
    include: { member: { select: { id: true, name: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(entries);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const entry = await prisma.bazarEntry.create({
    data: { ...body, date: new Date(body.date), updatedBy: session.user.id },
    include: { member: { select: { id: true, name: true } } },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "CREATE_BAZAR",
    entityType: "BazarEntry",
    entityId: entry.id,
    newValue: entry,
    request: req,
  });

  return NextResponse.json(entry, { status: 201 });
}
