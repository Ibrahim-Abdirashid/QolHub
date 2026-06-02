import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSession, requireRole } from "@/lib/auth";
import { z } from "zod";

const querySchema = z.object({
  role: z.enum(["admin", "landlord", "tenant"]).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  page: z.coerce.number().min(1).default(1),
});

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!requireRole(session, ["admin"])) {
      return Response.json({ error: "Lama ogola" }, { status: 403 });
    }

    const url = new URL(request.url);
    const params = querySchema.parse({
      role: url.searchParams.get("role") || undefined,
      limit: url.searchParams.get("limit") ?? 20,
      page: url.searchParams.get("page") ?? 1,
    });

    await connectDB();

    const filter: Record<string, unknown> = {};
    if (params.role) {
      filter.role = params.role;
    }

    const skip = (params.page - 1) * params.limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(params.limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const stats = {
      total: await User.countDocuments(),
      admins: await User.countDocuments({ role: "admin" }),
      landlords: await User.countDocuments({ role: "landlord" }),
      tenants: await User.countDocuments({ role: "tenant" }),
    };

    return Response.json({
      success: true,
      data: users,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        pages: Math.ceil(total / params.limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
