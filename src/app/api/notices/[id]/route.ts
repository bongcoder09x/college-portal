import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Notice } from "@/models/Notice";
import { apiUser, handleError } from "@/lib/api";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await apiUser(req, ["admin", "staff"]);
    await dbConnect();
    await Notice.findByIdAndDelete(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await apiUser(req, ["admin", "staff"]);
    const body = await req.json().catch(() => ({}));
    await dbConnect();
    const notice = await Notice.findByIdAndUpdate(
      params.id,
      { $set: { pinned: Boolean(body.pinned) } },
      { new: true }
    );
    return NextResponse.json({ notice });
  } catch (error) {
    return handleError(error);
  }
}
