import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { createSession } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    await connectDB();
    const user = await User.findOne({ email: data.email });
    if (!user) {
      return NextResponse.json(
        { error: "Email ama erayga sirta ah waa khalad" },
        { status: 401 }
      );
    }

    if (user.isDeleted) {
      return NextResponse.json(
        { error: "Akoonkan ma jiro nidaamka." },
        { status: 403 }
      );
    }

    if (user.blocked) {
      return NextResponse.json(
        {
          error: "Your account is blocked.",
          blocked: true,
          blockReason: user.blockReason || "You have violated the system policy.",
        },
        { status: 403 }
      );
    }

    // Landlord-ka: hubi in admin uu ansixiyay akoonka
    if (user.role === "landlord" && user.accountStatus === "pending") {
      return NextResponse.json(
        {
          error: "Akoonkaaga wali ma ansixin admin. Fadlan sug xaqiijinta.",
          pendingApproval: true,
        },
        { status: 403 }
      );
    }

    if (user.role === "landlord" && user.accountStatus === "rejected") {
      return NextResponse.json(
        {
          error: "Akoonkaaga waa la diiday. Xiriir admin si aad u ogaato sababta.",
          rejected: true,
        },
        { status: 403 }
      );
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Email ama erayga sirta ah waa khalad" },
        { status: 401 }
      );
    }

    await createSession({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      accountStatus: user.accountStatus,
      emailVerified: user.emailVerified,
    });

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Xogta ma saxna" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}
