import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Fee } from "@/models/Fee";
import { apiUser, handleError, requireFields } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await apiUser(req);
    const url = new URL(req.url);
    const student = url.searchParams.get("student");

    await dbConnect();
    const filter: Record<string, unknown> = {};
    if (student) filter.student = student;

    const fees = await Fee.find(filter)
      .populate({ path: "student", select: "rollNo user", populate: { path: "user", select: "name" } })
      .sort({ dueDate: 1 })
      .lean();
    return NextResponse.json({ fees });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    await apiUser(req, ["admin"]);
    const body = await req.json().catch(() => ({}));
    requireFields(body, ["student", "title", "amount"]);

    await dbConnect();
    const fee = await Fee.create({
      student: body.student,
      title: body.title,
      semester: body.semester,
      amount: Number(body.amount),
      dueDate: body.dueDate || undefined,
    });
    return NextResponse.json({ fee }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
