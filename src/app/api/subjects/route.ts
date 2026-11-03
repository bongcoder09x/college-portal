import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Subject } from "@/models/Subject";
import { apiUser, handleError, requireFields } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const course = url.searchParams.get("course");
    const semester = url.searchParams.get("semester");

    await dbConnect();
    const filter: Record<string, unknown> = {};
    if (course) filter.course = course;
    if (semester) filter.semester = Number(semester);

    const subjects = await Subject.find(filter)
      .populate("course", "name code")
      .populate({ path: "staff", populate: { path: "user", select: "name" } })
      .sort({ semester: 1, name: 1 })
      .lean();
    return NextResponse.json({ subjects });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    await apiUser(req, ["admin"]);
    const body = await req.json().catch(() => ({}));
    requireFields(body, ["name", "code", "course", "semester"]);
    await dbConnect();
    const subject = await Subject.create(body);
    return NextResponse.json({ subject }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
