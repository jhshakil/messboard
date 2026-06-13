import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const tempPlainPassword = crypto.randomBytes(4).toString("hex");
  const hashed = await bcrypt.hash(tempPlainPassword, 12);

  await prisma.user.update({
    where: { id },
    data: {
      tempPassword: hashed,
      forcePasswordChange: true,
      passwordChangedAt: new Date(),
    },
  });

  // Invalidate all existing sessions for this user
  await prisma.session.deleteMany({ where: { userId: id } });

  await createAuditLog({
    userId: session.user.id,
    action: "RESET_PASSWORD",
    entityType: "User",
    entityId: id,
    request: req,
  });

  return NextResponse.json({
    success: true,
    tempPassword: tempPlainPassword,
    message: "Password reset. Share the temporary password with the user.",
  });
}
