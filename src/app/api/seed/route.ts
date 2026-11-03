import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";
import { handleError, ApiError } from "@/lib/api";
import { User } from "@/models/User";
import { dbConnect } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/seed
 * Runs the demo-data seeder. Allowed when the database is empty, or when the
 * request carries the SEED_TOKEN header set in the environment.
 */
export async function POST(req: Request) {
  try {
    const token = req.headers.get("x-seed-token");
    const expected = process.env.SEED_TOKEN;

    await dbConnect();
    const userCount = await User.countDocuments();

    if (userCount > 0) {
      if (!expected || token !== expected) {
        throw new ApiError("Database already has data. Send the x-seed-token header to reseed.", 403);
      }
    }

    const summary = await seedDatabase();
    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    return handleError(error);
  }
}
