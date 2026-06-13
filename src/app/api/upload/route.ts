import { auth } from "@/lib/auth";
import { imagekit } from "@/lib/imagekit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "cleaning";

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: "File too large (max 10MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "jpg";

    const result = await imagekit.upload({
      file: buffer,
      fileName: `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`,
      folder: `/messboard/${folder}`,
      useUniqueFileName: true,
      isPrivateFile: false,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      thumbnailUrl: result.thumbnailUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Upload failed" }, { status: 500 });
  }
}
