import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Department } from "@/models/Department";
import { apiUser, handleError, requireFields } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const departments = await Department.find().sort({ name: 1 }).lean();
    return NextResponse.json({ departments });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    await apiUser(req, ["admin"]);
    const body = await req.json().catch(() => ({}));
    requireFields(body, ["name", "code"]);
    await dbConnect();
    const department = await Department.create(body);
    return NextResponse.json({ department }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
