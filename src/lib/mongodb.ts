import mongoose from "mongoose";
import { cleanupBlockedUsers } from "./cleanup";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Fadlan ku dar MONGODB_URI .env file-ka");
  }

  if (cached.conn) {
    // Run cleanup asynchronously without awaiting to keep connection response fast
    cleanupBlockedUsers().catch((err) => console.error("Cleanup error:", err));
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false });
  }

  cached.conn = await cached.promise;
  
  // Run cleanup asynchronously
  cleanupBlockedUsers().catch((err) => console.error("Cleanup error:", err));

  return cached.conn;
}

