import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: body.isActive },
    select: {
      id: true, name: true, email: true, image: true,
      role: true, isActive: true, createdAt: true, updatedAt: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ message: "Only superadmin can delete members" }, { status: 403 });
  }

  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ message: "Cannot delete yourself" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  // Delete all related data
  await prisma.auditLog.deleteMany({ where: { userId: id } });
  await prisma.meal.deleteMany({ where: { memberId: id } });
  await prisma.bazarEntry.deleteMany({ where: { memberId: id } });
  await prisma.transaction.deleteMany({ where: { memberId: id } });
  await prisma.cleaningLog.deleteMany({ where: { memberId: id } });
  await prisma.note.deleteMany({ where: { memberId: id } });
  await prisma.account.deleteMany({ where: { userId: id } });
  await prisma.session.deleteMany({ where: { userId: id } });

  await prisma.user.delete({ where: { id } });

  await createAuditLog({
    userId: session.user.id,
    action: "DELETE_USER",
    entityType: "User",
    entityId: id,
    oldValue: { name: user.name, email: user.email, role: user.role },
    request: req,
  });

  return NextResponse.json({ success: true, message: "User and all data deleted" });
}
