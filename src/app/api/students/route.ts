import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Student } from "@/models/Student";
import { apiUser, ApiError, handleError, requireFields } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await apiUser(req, ["admin", "staff"]);
    const url = new URL(req.url);
    const course = url.searchParams.get("course");
    const semester = url.searchParams.get("semester");

    await dbConnect();
    const filter: Record<string, unknown> = {};
    if (course) filter.course = course;
    if (semester) filter.semester = Number(semester);

    const students = await Student.find(filter)
      .populate("user", "name email phone isActive")
      .populate("course", "name code")
      .populate("department", "name code")
      .sort({ rollNo: 1 })
      .lean();

    return NextResponse.json({ students });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    await apiUser(req, ["admin"]);
    const body = await req.json().catch(() => ({}));
    requireFields(body, ["name", "email", "password", "rollNo", "course", "semester"]);

    await dbConnect();
    const existing = await User.findOne({ email: String(body.email).toLowerCase() });
    if (existing) throw new ApiError("A user with this email already exists.", 409);

    const user = await User.create({
      name: body.name,
      email: body.email,
      passwordHash: await bcrypt.hash(String(body.password), 10),
      role: "student",
      phone: body.phone,
    });

    try {
      const student = await Student.create({
        user: user._id,
        rollNo: body.rollNo,
        registrationNo: body.registrationNo,
        course: body.course,
        department: body.department,
        semester: Number(body.semester),
        batch: body.batch,
        guardianName: body.guardianName,
        guardianPhone: body.guardianPhone,
        address: body.address,
        admissionYear: body.admissionYear,
      });
      return NextResponse.json({ student }, { status: 201 });
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      throw error;
    }
  } catch (error) {
    return handleError(error);
  }
}
