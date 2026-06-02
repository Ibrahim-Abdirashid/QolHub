import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { getSession, requireRole } from "@/lib/auth";
import { serializeProperty } from "@/lib/api";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!requireRole(session, ["admin"])) {
      return NextResponse.json({ error: "Lama ogola" }, { status: 403 });
    }

    const { id } = await params;
    const { action } = schema.parse(await request.json());

    await connectDB();
    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json({ error: "Guriga lama helin" }, { status: 404 });
    }

    property.status = action === "approve" ? "active" : "rejected";
    if (action === "approve") property.verified = true;
    await property.save();

    const populated = await Property.findById(id)
      .populate("landlord", "name phone avatar")
      .lean();

    return NextResponse.json({
      property: serializeProperty(populated as Record<string, unknown>),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Xogta ma saxna" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}
