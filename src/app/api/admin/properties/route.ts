import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { getSession, requireRole } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!requireRole(session, ["admin"])) {
      return NextResponse.json({ error: "Lama ogola" }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get("status") || "pending";
    const limit = Math.min(Number(searchParams.get("limit") || 50), 100);
    const page = Number(searchParams.get("page") || 1);
    const skip = (page - 1) * limit;

    // Get properties with specified status
    const properties = await Property.find({ status })
      .populate("landlord", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Property.countDocuments({ status });

    // Get summary statistics
    const [pendingCount, activeCount, rejectedCount, rentedCount] =
      await Promise.all([
        Property.countDocuments({ status: "pending" }),
        Property.countDocuments({ status: "active" }),
        Property.countDocuments({ status: "rejected" }),
        Property.countDocuments({ status: "rented" }),
      ]);

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        pending: pendingCount,
        active: activeCount,
        rejected: rejectedCount,
        rented: rentedCount,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}
