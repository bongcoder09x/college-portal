import mongoose from "mongoose";

type Cache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalCache = globalThis as unknown as { __mongooseCache?: Cache };
const cached: Cache = globalCache.__mongooseCache ?? { conn: null, promise: null };
globalCache.__mongooseCache = cached;

/**
 * Cached connection so hot reloads and serverless invocations reuse one socket pool.
 */
export async function dbConnect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env.local and paste your MongoDB Atlas connection string."
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || "college_portal",
      serverSelectionTimeoutMS: 10000,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
