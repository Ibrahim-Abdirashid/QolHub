import mongoose, { Schema, models, model } from "mongoose";
import type { UserRole } from "@/types";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  blocked?: boolean;
  blockReason?: string;
  deleteAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ["admin", "landlord", "tenant", "super_admin"],
      default: "tenant",
    },
    avatar: { type: String },
    blocked: { type: Boolean, default: false },
    blockReason: { type: String },
    deleteAt: { type: Date },
    accountStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    isDeleted: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
