import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Property } from "@/models/Property";
import { Booking } from "@/models/Booking";
import { Message } from "@/models/Message";
import { getSession, requireRole } from "@/lib/auth";

export async function DELETE(
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
    if (!targetUser || !targetUser.isDeleted) {
      return Response.json({ error: "User lama helin Recycle Bin-ka" }, { status: 404 });
    }

    // Permanently delete user and all related data
    await Promise.all([
      Property.deleteMany({ landlord: id }),
      Booking.deleteMany({ $or: [{ tenant: id }, { landlord: id }] }),
      Message.deleteMany({ $or: [{ sender: id }, { receiver: id }] }),
    ]);
    await User.findByIdAndDelete(id);

    return Response.json({ success: true, message: "User-ka si buuxda ayaa looga tirtirtay nidaamka." });
  } catch (error) {
    console.error("Error permanently deleting user:", error);
    return Response.json({ error: "Cilad ayaa dhacday" }, { status: 500 });
  }
}
