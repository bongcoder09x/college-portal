import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { COOKIE_NAME, SESSION_MAX_AGE, ROLE_HOME, signSession, type Role } from "@/lib/auth";
import { ApiError, handleError, requireFields } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    requireFields(body, ["email", "password"]);

    await dbConnect();
    const user = await User.findOne({ email: String(body.email).toLowerCase().trim() }).select("+passwordHash");
    if (!user || !user.isActive) throw new ApiError("Invalid email or password.", 401);

    const valid = await bcrypt.compare(String(body.password), user.passwordHash);
    if (!valid) throw new ApiError("Invalid email or password.", 401);

    const role = user.role as Role;
    const token = await signSession({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role,
    });

    user.lastLoginAt = new Date();
    await user.save();

    const res = NextResponse.json({
      user: { id: String(user._id), name: user.name, email: user.email, role },
      redirectTo: ROLE_HOME[role],
    });
    res.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (error) {
    return handleError(error);
  }
}
