import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const updated = await prisma.transaction.update({
    where: { id },
    data: { ...body, ...(body.date ? { date: new Date(body.date) } : {}), updatedBy: session.user.id },
    include: { member: { select: { id: true, name: true } } },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "UPDATE_TRANSACTION",
    entityType: "Transaction",
    entityId: id,
    oldValue: existing,
    newValue: updated,
    request: req,
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });

  if (session.user.role === "USER") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await prisma.transaction.delete({ where: { id } });

  await createAuditLog({
    userId: session.user.id,
    action: "DELETE_TRANSACTION",
    entityType: "Transaction",
    entityId: id,
    oldValue: existing,
    request: req,
  });

  return NextResponse.json({ success: true });
}
