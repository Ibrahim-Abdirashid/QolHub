import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { getSession, requireRole } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!requireRole(session, ["admin", "landlord"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    if (files.length > 10) {
      return NextResponse.json({ error: "Maximum 10 files allowed" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Invalid file type. Only images are allowed" },
          { status: 400 }
        );
      }

      // 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File too large. Maximum size is 5MB" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      
      const uploadDir = join(process.cwd(), "public", "uploads");
      const filepath = join(uploadDir, filename);

      await writeFile(filepath, buffer);
      
      // The public URL to access the image
      uploadedUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
}
