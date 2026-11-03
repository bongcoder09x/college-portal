import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Student } from "@/models/Student";
import { Staff } from "@/models/Staff";
import { Course } from "@/models/Course";
import { Fee } from "@/models/Fee";
import { Notice } from "@/models/Notice";
import { apiUser, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await apiUser(req, ["admin"]);
    await dbConnect();

    const [students, staff, courses, notices, dues] = await Promise.all([
      Student.countDocuments(),
      Staff.countDocuments(),
      Course.countDocuments(),
      Notice.countDocuments(),
      Fee.aggregate([
        { $match: { status: { $ne: "paid" } } },
        { $group: { _id: null, total: { $sum: { $subtract: ["$amount", "$paidAmount"] } }, count: { $sum: 1 } } },
      ]),
    ]);

    return NextResponse.json({
      students,
      staff,
      courses,
      notices,
      pendingFees: dues[0]?.count ?? 0,
      outstandingAmount: dues[0]?.total ?? 0,
      users: await User.countDocuments(),
    });
  } catch (error) {
    return handleError(error);
  }
}
