import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { Property } from "@/models/Property";
import { User } from "@/models/User";
import { getSession, requireRole } from "@/lib/auth";

const createBookingSchema = z.object({
  propertyId: z.string().min(1, "Property ID required"),
  inquiryMessage: z.string().min(5, "Message must be at least 5 characters"),
});

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Lama soo gali" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = Math.min(Number(searchParams.get("limit") || 20), 50);

    let filter: Record<string, unknown> = {};

    // Tenants see their bookings
    if (session.role === "tenant") {
      filter.tenant = session.id;
    }
    // Landlords see bookings for their properties
    else if (session.role === "landlord") {
      filter.landlord = session.id;
    }
    // Admins can see all bookings
    else if (session.role !== "admin") {
      return NextResponse.json({ error: "Lama ogola" }, { status: 403 });
    }

    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate("property", "title price")
      .populate("tenant", "name email phone")
      .populate("landlord", "name email phone")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ bookings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "tenant") {
      return NextResponse.json(
        { error: "Tenants kaliya waxay bookings samayn karaan" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const validated = createBookingSchema.parse(data);

    await connectDB();

    // Check if property exists and is active
    const property = await Property.findById(validated.propertyId);
    if (!property) {
      return NextResponse.json(
        { error: "Guri la helin maayo" },
        { status: 404 }
      );
    }

    if (property.status !== "active") {
      return NextResponse.json(
        { error: "Guri-gun kiro loo yaqaan maayo" },
        { status: 400 }
      );
    }

    // Check if tenant already contacted for this property
    const existingBooking = await Booking.findOne({
      property: validated.propertyId,
      tenant: session.id,
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "Horey ayaad ula xidhiidhay mulkiilaha gurigan." },
        { status: 400 }
      );
    }

    // Get landlord info
    const landlord = await User.findById(property.landlord);
    if (!landlord) {
      return NextResponse.json(
        { error: "Milkiile la helin maayo" },
        { status: 404 }
      );
    }

    // Create booking
    const booking = await Booking.create({
      property: validated.propertyId,
      tenant: session.id,
      landlord: property.landlord,
      inquiryMessage: validated.inquiryMessage,
      status: "pending",
    });

    await booking.populate("property", "title price");
    await booking.populate("tenant", "name email phone");
    await booking.populate("landlord", "name email phone");

    return NextResponse.json(
      {
        message: "Codsiga waa la diray! Milkiiluhu wuu kuu soo jawaabi doonaa",
        booking: booking.toObject(),
      },
      { status: 201 }
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
