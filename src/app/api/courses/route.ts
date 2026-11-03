import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Course } from "@/models/Course";
import { apiUser, handleError, requireFields } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const courses = await Course.find().populate("department", "name code").sort({ name: 1 }).lean();
    return NextResponse.json({ courses });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    await apiUser(req, ["admin"]);
    const body = await req.json().catch(() => ({}));
    requireFields(body, ["name", "code", "department"]);
    await dbConnect();
    const course = await Course.create(body);
    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
