import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Message } from "@/models/Message";
import { User } from "@/models/User";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ count: 0 });
    }

    await connectDB();
    
    // Check if the user is blocked in the database
    const dbUser = await User.findById(session.id).select("blocked blockReason deleteAt");
    if (dbUser && dbUser.blocked) {
      return NextResponse.json({
        count: 0,
        blocked: true,
        blockReason: dbUser.blockReason || "You have violated the system policy.",
        deleteAt: dbUser.deleteAt ? dbUser.deleteAt.toISOString() : new Date(Date.now() + 60 * 1000).toISOString(),
      });
    }

    const count = await Message.countDocuments({
      receiver: session.id,
      read: false,
    });

    return NextResponse.json({ count });
  } catch (err) {
    console.error("Error fetching unread message count:", err);
    return NextResponse.json({ count: 0 });
  }
}
