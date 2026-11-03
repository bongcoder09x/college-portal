import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Result } from "@/models/Result";
import { Staff } from "@/models/Staff";
import { apiUser, handleError, requireFields } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await apiUser(req);
    const url = new URL(req.url);
    const student = url.searchParams.get("student");

    await dbConnect();
    const filter: Record<string, unknown> = {};
    if (student) filter.student = student;

    const results = await Result.find(filter)
      .populate("subject", "name code semester credits")
      .sort({ semester: 1 })
      .lean();
    return NextResponse.json({ results, requestedBy: user.role });
  } catch (error) {
    return handleError(error);
  }
}

/** POST /api/results — body may carry one entry or an array under `entries` */
export async function POST(req: Request) {
  try {
    const user = await apiUser(req, ["admin", "staff"]);
    const body = await req.json().catch(() => ({}));
    await dbConnect();
    const staff = await Staff.findOne({ user: user.id });

    const entries = Array.isArray(body.entries) ? body.entries : [body];
    const ops = entries.map((entry: Record<string, unknown>) => {
      requireFields(entry, ["student", "subject", "semester", "marksObtained"]);
      return {
        updateOne: {
          filter: {
            student: entry.student,
            subject: entry.subject,
            examType: entry.examType || "final",
          },
          update: {
            $set: {
              semester: Number(entry.semester),
              marksObtained: Number(entry.marksObtained),
              maxMarks: Number(entry.maxMarks || 100),
              publishedBy: staff?._id,
            },
          },
          upsert: true,
        },
      };
    });

    await Result.bulkWrite(ops);
    return NextResponse.json({ saved: ops.length }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
