import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

const DEMO_EMAILS = [
  "admin@qolhub.so",
  "milkiile@qolhub.so",
  "tenant@qolhub.so",
];

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Lama ogola" }, { status: 403 });
  }

  try {
    await connectDB();

    const result = await User.updateMany(
      { email: { $in: DEMO_EMAILS } },
      { $set: { emailVerified: true } }
    );

    return NextResponse.json({
      message: "Demo accounts waa la cusbooneysiiyay",
      updated: result.modifiedCount,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}
