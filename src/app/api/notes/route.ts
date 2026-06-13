import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const notes = await prisma.note.findMany({
    include: { member: { select: { id: true, name: true } } },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const note = await prisma.note.create({
    data: { ...body, memberId: session.user.id, updatedBy: session.user.id },
    include: { member: { select: { id: true, name: true } } },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "CREATE_NOTE",
    entityType: "Note",
    entityId: note.id,
    newValue: note,
    request: req,
  });

  return NextResponse.json(note, { status: 201 });
}
