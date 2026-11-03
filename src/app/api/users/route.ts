import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { apiUser, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await apiUser(req, ["admin"]);
    await dbConnect();
    const users = await User.find().sort({ createdAt: -1 }).limit(200).lean();
    return NextResponse.json({ users });
  } catch (error) {
    return handleError(error);
  }
}
