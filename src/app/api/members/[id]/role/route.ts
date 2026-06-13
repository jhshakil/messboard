import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";
import { CAN_ASSIGN_ROLE } from "@/constants/roles";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { role } = body;

  const userRole = session.user.role as string;
  const assignableRoles = CAN_ASSIGN_ROLE[userRole] || [];

  if (!assignableRoles.includes(role)) {
    return NextResponse.json({ message: "You cannot assign this role" }, { status: 403 });
  }

  // Enforce single SUPERADMIN: downgrade existing superadmin(s) when promoting someone else
  if (role === "SUPERADMIN") {
    const existingSuperadmins = await prisma.user.findMany({
      where: { role: "SUPERADMIN", id: { not: id } },
    });
    for (const sa of existingSuperadmins) {
      await prisma.user.update({ where: { id: sa.id }, data: { role: "ADMIN" } });
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true, name: true, email: true, image: true,
      role: true, isActive: true, createdAt: true, updatedAt: true,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "CHANGE_ROLE",
    entityType: "User",
    entityId: id,
    newValue: { role },
    request: req,
  });

  return NextResponse.json(updated);
}
