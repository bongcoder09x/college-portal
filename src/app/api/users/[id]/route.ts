import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { apiUser, handleError } from "@/lib/api";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await apiUser(req, ["admin"]);
    const body = await req.json().catch(() => ({}));
    await dbConnect();

    const update: Record<string, unknown> = {};
    if (typeof body.isActive === "boolean") update.isActive = body.isActive;
    if (body.name) update.name = body.name;
    if (body.phone !== undefined) update.phone = body.phone;
    if (body.password) update.passwordHash = await bcrypt.hash(String(body.password), 10);

    const user = await User.findByIdAndUpdate(params.id, { $set: update }, { new: true }).lean();
    return NextResponse.json({ user });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await apiUser(req, ["admin"]);
    await dbConnect();
    await User.findByIdAndDelete(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
