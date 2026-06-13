import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { PAGE_KEYS } from "@/constants/pages";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const visibilities = await prisma.pageVisibility.findMany();

  return NextResponse.json(visibilities);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { pageKey, isVisible } = await req.json();

  const result = await prisma.pageVisibility.upsert({
    where: { pageKey },
    update: { isVisible, updatedBy: session.user.id },
    create: { pageKey, isVisible, updatedBy: session.user.id },
  });

  return NextResponse.json(result);
}
