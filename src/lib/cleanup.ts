import mongoose from "mongoose";
import { User } from "@/models/User";
import { Property } from "@/models/Property";
import { Booking } from "@/models/Booking";
import { Message } from "@/models/Message";

let lastCleanup = 0;
const CLEANUP_INTERVAL = 15000; // 15 seconds throttle

export async function cleanupBlockedUsers() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) {
    return;
  }
  lastCleanup = now;

  try {
    // Find users whose deleteAt has passed
    const expiredUsers = await User.find({
      deleteAt: { $lte: new Date() },
    }).select("_id");

    if (expiredUsers.length === 0) return;

    console.log(`[Cleanup] Found ${expiredUsers.length} expired blocked users. Starting cascade delete...`);

    const userIds = expiredUsers.map((u) => u._id);

    // Perform cascade deletion
    await Promise.all([
      Property.deleteMany({ landlord: { $in: userIds } }),
      Booking.deleteMany({ $or: [{ tenant: { $in: userIds } }, { landlord: { $in: userIds } }] }),
      Message.deleteMany({ $or: [{ sender: { $in: userIds } }, { receiver: { $in: userIds } }] }),
      User.deleteMany({ _id: { $in: userIds } }),
    ]);

    console.log(`[Cleanup] Successfully cascade deleted ${expiredUsers.length} blocked users and their associated data.`);
  } catch (error) {
    console.error("[Cleanup] Error during user cleanup:", error);
  }
}
