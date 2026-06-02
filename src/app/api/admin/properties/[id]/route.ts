import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { getSession, requireRole } from "@/lib/auth";

const moderateSchema = z.object({
  action: z.enum(["approve", "reject", "delete"]),
  reason: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!requireRole(session, ["admin"])) {
      return NextResponse.json({ error: "Lama ogola" }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const property = await Property.findById(id)
      .populate("landlord", "name email phone");

    if (!property) {
      return NextResponse.json(
        { error: "Guri la helin maayo" },
        { status: 404 }
      );
    }

    return NextResponse.json({ property });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!requireRole(session, ["admin"])) {
      return NextResponse.json({ error: "Lama ogola" }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();
    const validated = moderateSchema.parse(data);

    await connectDB();

    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json(
        { error: "Guri la helin maayo" },
        { status: 404 }
      );
    }

    if (validated.action === "approve") {
      // Check if already active or rejected
      if (property.status !== "pending") {
        return NextResponse.json(
          { error: "Guri-gan waa horey oo xukumay" },
          { status: 400 }
        );
      }

      property.status = "active";
      property.verified = true;
      await property.save();

      return NextResponse.json({
        message: "Guri waa loo ansixiyay!",
        property: property.toObject(),
      });
    } else if (validated.action === "reject") {
      if (property.status !== "pending") {
        return NextResponse.json(
          { error: "Guri-gan waa horey oo xukumay" },
          { status: 400 }
        );
      }

      property.status = "rejected";
      property.verified = false;
      
      // Store rejection reason
      if (validated.reason) {
        (property as any).rejectionReason = validated.reason;
      }
      
      await property.save();

      return NextResponse.json({
        message: "Guri waa la diidday",
        property: property.toObject(),
      });
    } else if (validated.action === "delete") {
      await Property.deleteOne({ _id: id });

      return NextResponse.json({
        message: "Guri waa la tirtiry",
      });
    }

    return NextResponse.json(
      { error: "Xulka si loo gaabsan maayo" },
      { status: 400 }
    );
  } catch (err) {
    console.error(err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Xogta si loo gaabsan maayo", details: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}
