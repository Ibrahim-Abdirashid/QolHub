import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { getSession } from "@/lib/auth";
import { serializeProperty } from "@/lib/api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !["admin", "landlord"].includes(session.role)) {
      return NextResponse.json({ error: "Lama ogola" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();
    const property = await Property.findById(id);

    if (!property) {
      return NextResponse.json({ error: "Guriga lama helin" }, { status: 404 });
    }

    const isOwner = property.landlord.toString() === session.id;
    const isAdmin = session.role === "admin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Lama ogola" }, { status: 403 });
    }

    // Only allow changing status if current status is "active" or "rented"
    if (!["active", "rented"].includes(property.status)) {
      return NextResponse.json(
        { error: "Guryaha la ogolaaday oo kaliya ayaa la bedeli karaa status-kooda" },
        { status: 400 }
      );
    }

    // Read requested status from body if present, else toggle
    const body = await request.json().catch(() => ({}));
    let newStatus = body.status;
    if (!newStatus || !["active", "rented"].includes(newStatus)) {
      newStatus = property.status === "active" ? "rented" : "active";
    }

    property.status = newStatus as "active" | "rented";
    
    if (newStatus === "rented") {
      // Set to delete automatically after 24 hours
      property.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    } else {
      // Clear auto-delete timer if marked active again
      property.expiresAt = undefined;
    }

    await property.save();

    const populated = await Property.findById(id)
      .populate("landlord", "name phone avatar")
      .lean();

    return NextResponse.json({
      property: serializeProperty(populated as Record<string, unknown>),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Cilad ayaa dhacday" },
      { status: 500 }
    );
  }
}
