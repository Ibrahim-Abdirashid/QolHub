import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Property } from "@/models/Property";
import { Booking } from "@/models/Booking";
import { Message } from "@/models/Message";
import { getSession, requireRole } from "@/lib/auth";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["block", "unblock", "account_status", "verify_email"]).optional(),
  blockReason: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!requireRole(session, ["admin", "super_admin"])) {
      return Response.json({ error: "Lama ogola" }, { status: 403 });
    }

    const body = await request.json();
    const { action, blockReason } = actionSchema.parse(body);

    if (session!.id === id && action === "block") {
      return Response.json({ error: "Ma xannibi kartid akoonkaaga" }, { status: 400 });
    }

    await connectDB();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Regular admin cannot block other admins or super_admin
    if (session!.role === "admin" && ["admin", "super_admin"].includes(targetUser.role)) {
      return Response.json({ error: "Awood kuma lihid inaad admin kale xirto" }, { status: 403 });
    }

    if (action === "block") {
      targetUser.blocked = true;
      const reason = blockReason || "You have violated the system policy.";
      targetUser.blockReason = reason;
      targetUser.deleteAt = new Date(Date.now() + 60 * 1000); // 1 minute after block
      
      // Send a message to the user
      await Message.create({
        sender: session!.id,
        receiver: targetUser._id,
        property: null,
        content: `OGEYSIIS XAYIRAAD: Akoonkaaga waa la xannibay. Sababta: ${reason}. Akoonkaaga iyo xogtaada waa la tirtiri doonaa 1 daqiiqo gudahood.`,
        read: false,
      });
    } else if (action === "unblock") {
      targetUser.blocked = false;
      targetUser.blockReason = undefined;
      targetUser.deleteAt = undefined;
    } else if (action === "account_status" && body.status) {
      targetUser.accountStatus = body.status;
    } else if (action === "verify_email") {
      targetUser.emailVerified = true;
      targetUser.verificationToken = undefined;
    }

    await targetUser.save();

    return Response.json({ success: true, data: { id: targetUser._id, blocked: targetUser.blocked } });
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}

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

    if (session!.id === id) {
      return Response.json({ error: "Ma tirtiri kartid akoonkaaga" }, { status: 400 });
    }

    await connectDB();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Regular admin cannot delete other admins or super_admin
    if (session!.role === "admin" && ["admin", "super_admin"].includes(targetUser.role)) {
      return Response.json({ error: "Awood kuma lihid inaad admin kale tirtirto" }, { status: 403 });
    }

    // Soft delete: mark user and their properties as deleted
    await Promise.all([
      User.findByIdAndUpdate(id, { isDeleted: true, blocked: true }),
      Property.updateMany({ landlord: id }, { isDeleted: true }),
    ]);

    return Response.json({ success: true, message: "User-ka waxaa la geeyay Recycle Bin-ka." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
