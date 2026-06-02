import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Property } from "@/models/Property";
import { getSession, requireRole } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!requireRole(session, ["admin"])) {
      return NextResponse.json({ error: "Lama ogola" }, { status: 403 });
    }

    await connectDB();

    const [totalUsers, activeHouses, pendingHouses, recentUsers] =
      await Promise.all([
        User.countDocuments(),
        Property.countDocuments({ status: "active" }),
        Property.countDocuments({ status: "pending" }),
        User.find().sort({ createdAt: -1 }).limit(5).select("name role createdAt").lean(),
      ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        activeHouses,
        pendingHouses,
        monthlyRevenue: 0,
      },
      recentUsers,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}
