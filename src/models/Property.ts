import mongoose, { Schema, models, model } from "mongoose";
import type {
  ListingMode,
  PropertyStatus,
  PropertyType,
} from "@/types";
import "./User"; // Ensure User model is registered

export interface IProperty {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  city: string;
  district: string;
  propertyType: PropertyType;
  listingMode: ListingMode;
  price: number;
  rooms: number;
  bathrooms: number;
  area?: number;
  availableRooms?: number;
  images: string[];
  amenities: string[];
  status: PropertyStatus;
  verified: boolean;
  rejectionReason?: string;
  landlord: mongoose.Types.ObjectId;
  expiresAt?: Date; // For auto-deletion after rented
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    propertyType: {
      type: String,
      enum: ["full_house", "apartment", "room"],
      required: true,
    },
    listingMode: {
      type: String,
      enum: ["entire_available", "rooms_available"],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    rooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    area: { type: Number },
    availableRooms: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "rented"],
      default: "pending",
    },
    verified: { type: Boolean, default: false },
    rejectionReason: { type: String },
    landlord: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

PropertySchema.index({ city: 1, status: 1 });
PropertySchema.index({ landlord: 1 });
PropertySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Property =
  models.Property || model<IProperty>("Property", PropertySchema);
