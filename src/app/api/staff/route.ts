import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Staff } from "@/models/Staff";
import { apiUser, ApiError, handleError, requireFields } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const staff = await Staff.find()
      .populate("user", "name email phone isActive")
      .populate("department", "name code")
      .sort({ employeeId: 1 })
      .lean();
    return NextResponse.json({ staff });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    await apiUser(req, ["admin"]);
    const body = await req.json().catch(() => ({}));
    requireFields(body, ["name", "email", "password", "employeeId"]);

    await dbConnect();
    const existing = await User.findOne({ email: String(body.email).toLowerCase() });
    if (existing) throw new ApiError("A user with this email already exists.", 409);

    const user = await User.create({
      name: body.name,
      email: body.email,
      passwordHash: await bcrypt.hash(String(body.password), 10),
      role: "staff",
      phone: body.phone,
    });

    try {
      const member = await Staff.create({
        user: user._id,
        employeeId: body.employeeId,
        department: body.department || undefined,
        designation: body.designation,
        qualification: body.qualification,
      });
      return NextResponse.json({ staff: member }, { status: 201 });
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      throw error;
    }
  } catch (error) {
    return handleError(error);
  }
}
