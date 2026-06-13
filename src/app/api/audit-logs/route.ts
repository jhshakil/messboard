import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const userId = searchParams.get("userId");
  const action = searchParams.get("action");
  const entityType = searchParams.get("entityType");
  const search = searchParams.get("search");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let where: any = {};
  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (entityType) where.entityType = entityType;
  if (search) {
    where.user = { name: { contains: search, mode: "insensitive" } };
  }
  if (from || to) {
    where.createdAt = {};
    if (from) {
      const [fy, fm, fd] = from.split("-").map(Number);
      where.createdAt.gte = new Date(fy, fm - 1, fd);
    }
    if (to) {
      const [ty, tm, td] = to.split("-").map(Number);
      where.createdAt.lt = new Date(ty, tm - 1, td + 1);
    }
  }

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}
