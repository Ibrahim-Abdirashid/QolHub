import mongoose, { Schema, models, model } from "mongoose";

export interface IMessage {
  _id: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Message =
  models.Message || model<IMessage>("Message", MessageSchema);
