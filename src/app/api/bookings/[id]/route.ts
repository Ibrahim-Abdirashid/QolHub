import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { getSession, requireRole } from "@/lib/auth";

const approveSchema = z.object({
  action: z.enum(["approve", "reject"]),
  response: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Lama soo gali" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const booking = await Booking.findById(id)
      .populate("property", "title price")
      .populate("tenant", "name email phone")
      .populate("landlord", "name email phone");

    if (!booking) {
      return NextResponse.json({ error: "Cods la helin maayo" }, { status: 404 });
    }

    // Check authorization - only tenant, landlord (owner), or admin can view
    if (
      session.role !== "admin" &&
      booking.tenant.toString() !== session.id &&
      booking.landlord.toString() !== session.id
    ) {
      return NextResponse.json({ error: "Lama ogola" }, { status: 403 });
    }

    return NextResponse.json({ booking });
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
    if (!session) {
      return NextResponse.json({ error: "Lama soo gali" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    const validated = approveSchema.parse(data);

    await connectDB();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Cods la helin maayo" }, { status: 404 });
    }

    // Only landlord can approve/reject their bookings
    if (booking.landlord.toString() !== session.id) {
      return NextResponse.json(
        { error: "Milkiile kaliya ayaa codsiga u jawaabi kara" },
        { status: 403 }
      );
    }

    // Can only respond to pending bookings
    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: "Cods-kan albaabka lama jaawaabi karo" },
        { status: 400 }
      );
    }

    // Update booking status and response
    booking.status = validated.action === "approve" ? "approved" : "rejected";
    if (validated.response) {
      booking.landlordResponse = validated.response;
    }

    await booking.save();

    const message =
      validated.action === "approve"
        ? "Codsiga waa la aqbalay!"
        : "Codsiga waa la diidday";

    return NextResponse.json({
      message,
      booking: booking.toObject(),
    });
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Lama soo gali" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Cods la helin maayo" }, { status: 404 });
    }

    // Only tenant can delete their own pending bookings
    if (booking.tenant.toString() !== session.id || session.role !== "tenant") {
      return NextResponse.json(
        { error: "Ardayga kaliya ayaa codsiga tirtiri kara" },
        { status: 403 }
      );
    }

    // Can only delete pending bookings
    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: "Cods-kan tirtiri karo maayo" },
        { status: 400 }
      );
    }

    await Booking.deleteOne({ _id: id });

    return NextResponse.json({ message: "Codsiga waa la tirtiry" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}
