import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSession, requireRole } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    // Only super_admin can create new admins
    if (!session || session.role !== "super_admin") {
      return NextResponse.json({ error: "Kaliya Super Admin ayaa admin cusub abuurta" }, { status: 403 });
    }

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Dhammaan xogta buuxi" }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email-kan horey ayuu u jiro" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    const serialized = {
      _id: String(newAdmin._id),
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      blocked: false,
      createdAt: newAdmin.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, user: serialized }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}
