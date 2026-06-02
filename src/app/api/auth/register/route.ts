import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { createSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.enum(["landlord", "tenant"]).default("tenant"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    await connectDB();

    const exists = await User.findOne({ email: data.email });
    if (exists) {
      return NextResponse.json(
        { error: "This email is already in use" },
        { status: 400 }
      );
    }

    // Landlord → pending (awaiting admin approval)
    // Tenant → approved immediately
    const accountStatus = data.role === "landlord" ? "pending" : "approved";
    const hashed = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      ...data,
      password: hashed,
      accountStatus,
      emailVerified: true, // No email verification needed; admin approves
    });

    // Tenant: create session immediately
    // Landlord: create session but they must wait for admin approval
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
        accountStatus: user.accountStatus,
      },
      // Landlord: notify them they are pending approval
      pendingApproval: data.role === "landlord",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
