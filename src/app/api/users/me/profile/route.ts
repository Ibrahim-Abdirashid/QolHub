import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  avatar: z.string().url().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.id).select("-password").lean();
    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updates = updateProfileSchema.parse(body);

    await connectDB();

    const user = await User.findByIdAndUpdate(session.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    return Response.json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    console.error("Error updating profile:", error);
    return Response.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
