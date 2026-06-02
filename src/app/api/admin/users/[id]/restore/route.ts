import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Property } from "@/models/Property";
import { getSession, requireRole } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!requireRole(session, ["admin", "super_admin"])) {
      return Response.json({ error: "Lama ogola" }, { status: 403 });
    }

    await connectDB();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return Response.json({ error: "User lama helin" }, { status: 404 });
    }

    // Restore user and their properties
    await Promise.all([
      User.findByIdAndUpdate(id, {
        isDeleted: false,
        blocked: false,
        $unset: { blockReason: 1, deleteAt: 1 },
      }),
      Property.updateMany({ landlord: id }, { isDeleted: false }),
    ]);

    return Response.json({ success: true, message: "User-ka si guul leh ayaa dib loogu soo celiyay." });
  } catch (error) {
    console.error("Error restoring user:", error);
    return Response.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}
