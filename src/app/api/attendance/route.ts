import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { Staff } from "@/models/Staff";
import { Student } from "@/models/Student";
import { apiUser, ApiError, handleError, requireFields } from "@/lib/api";

export const dynamic = "force-dynamic";

/** GET /api/attendance?subject=<id>&date=YYYY-MM-DD */
export async function GET(req: Request) {
  try {
    await apiUser(req, ["admin", "staff"]);
    const url = new URL(req.url);
    const subject = url.searchParams.get("subject");
    const date = url.searchParams.get("date");
    if (!subject || !date) throw new ApiError("Both subject and date query params are required.", 422);

    await dbConnect();
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);

    const record = await Attendance.findOne({
      subject,
      date: { $gte: day, $lt: next },
    })
      .populate("records.student", "rollNo")
      .lean();

    return NextResponse.json({ attendance: record });
  } catch (error) {
    return handleError(error);
  }
}

/** POST /api/attendance  { subject, course, semester, date, records: [{student, status}] } */
export async function POST(req: Request) {
  try {
    const user = await apiUser(req, ["admin", "staff"]);
    const body = await req.json().catch(() => ({}));
    requireFields(body, ["subject", "course", "semester", "date", "records"]);
    if (!Array.isArray(body.records) || body.records.length === 0) {
      throw new ApiError("records must be a non-empty array.", 422);
    }

    await dbConnect();
    const staff = await Staff.findOne({ user: user.id });
    if (!staff) throw new ApiError("Only faculty accounts can record attendance.", 403);

    const day = new Date(body.date);
    day.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      { subject: body.subject, date: day },
      {
        $set: {
          course: body.course,
          semester: Number(body.semester),
          takenBy: staff._id,
          records: body.records.map((r: { student: string; status: string }) => ({
            student: r.student,
            status: ["present", "absent", "late"].includes(r.status) ? r.status : "present",
          })),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ attendance }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

/** PATCH /api/attendance  { subject, date, student, status } — correct one entry */
export async function PATCH(req: Request) {
  try {
    await apiUser(req, ["admin", "staff"]);
    const body = await req.json().catch(() => ({}));
    requireFields(body, ["subject", "date", "student", "status"]);

    await dbConnect();
    const day = new Date(body.date);
    day.setHours(0, 0, 0, 0);

    const doc = await Attendance.findOne({ subject: body.subject, date: day });
    if (!doc) throw new ApiError("No attendance register found for that date.", 404);

    const entry = doc.records.find((r) => String(r.student) === String(body.student));
    if (entry) {
      entry.status = body.status;
    } else {
      doc.records.push({ student: body.student, status: body.status } as never);
    }
    await doc.save();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
