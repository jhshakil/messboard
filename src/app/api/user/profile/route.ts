import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, image } = body;

    if (!session.user.id) {
      return NextResponse.json({ message: "Session invalid — please re-login" }, { status: 401 });
    }

    const data: Record<string, string> = {};
    if (name !== undefined) data.name = name;
    if (image !== undefined) data.image = image;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, name: true, email: true, image: true, role: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.code === "ETIMEDOUT" || error.message?.includes("timeout")) {
      return NextResponse.json(
        { message: "Database connection timed out. Please try again." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { message: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
