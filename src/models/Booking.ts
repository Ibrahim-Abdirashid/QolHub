import mongoose, { Schema, models, model } from "mongoose";
import "./User"; // Ensure User model is registered
import "./Property"; // Ensure Property model is registered

export interface IBooking {
  _id: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  tenant: mongoose.Types.ObjectId;
  landlord: mongoose.Types.ObjectId;
  inquiryMessage: string;
  landlordResponse?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    landlord: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inquiryMessage: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
    },
    landlordResponse: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Prevent duplicate bookings from same tenant on same property
BookingSchema.index({ property: 1, tenant: 1, status: 1 });

export const Booking =
  models.Booking || model<IBooking>("Booking", BookingSchema);
