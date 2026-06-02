import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { getSession, requireRole } from "@/lib/auth";
import { serializeProperty } from "@/lib/api";
import { z } from "zod";

const updatePropertySchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  price: z.number().min(0).optional(),
  rooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  area: z.number().min(0).optional(),
  availableRooms: z.number().min(0).optional(),
  amenities: z.array(z.string()).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const property = await Property.findById(id)
      .populate("landlord", "name phone avatar email")
      .lean();

    if (!property) {
      return NextResponse.json({ error: "Guriga lama helin" }, { status: 404 });
    }

    const session = await getSession();
    const isOwner =
      session &&
      String((property.landlord as { _id: unknown })._id ?? property.landlord) ===
        session.id;
    const isAdmin = session?.role === "admin";

    if (property.status !== "active" && !isOwner && !isAdmin) {
      return NextResponse.json({ error: "Guriga lama helin" }, { status: 404 });
    }

    return NextResponse.json({
      property: serializeProperty(property as Record<string, unknown>),
    });
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
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const updates = updatePropertySchema.parse(body);

    await connectDB();

    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Only landlord can edit their own properties
    if (property.landlord.toString() !== session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Cannot edit non-pending/non-active properties
    if (!["pending", "active"].includes(property.status)) {
      return NextResponse.json(
        {
          error: "Cannot edit properties with this status",
        },
        { status: 400 }
      );
    }

    Object.assign(property, updates);
    await property.save();

    return NextResponse.json({
      success: true,
      data: property,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Lama ogola" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json({ error: "Guriga lama helin" }, { status: 404 });
    }

    const isOwner = property.landlord.toString() === session.id;
    if (!isOwner && session.role !== "admin") {
      return NextResponse.json({ error: "Lama ogola" }, { status: 403 });
    }

    if (session.role !== "admin" && property.status !== "pending") {
      return NextResponse.json(
        { error: "Guryaha 'Pending' ah oo kaliya ayaa la tirtiri karaa" },
        { status: 400 }
      );
    }

    await property.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}
