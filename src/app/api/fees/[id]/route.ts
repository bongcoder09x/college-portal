import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Fee } from "@/models/Fee";
import { apiUser, ApiError, handleError } from "@/lib/api";

/** PATCH /api/fees/:id  { paidAmount, reference } — records a payment */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await apiUser(req, ["admin"]);
    const body = await req.json().catch(() => ({}));

    await dbConnect();
    const fee = await Fee.findById(params.id);
    if (!fee) throw new ApiError("Fee record not found.", 404);

    const paid = Number(body.paidAmount ?? fee.amount);
    fee.paidAmount = Math.min(paid, fee.amount);
    fee.status = fee.paidAmount >= fee.amount ? "paid" : fee.paidAmount > 0 ? "partial" : "pending";
    fee.paidOn = fee.paidAmount > 0 ? new Date() : undefined;
    fee.reference = body.reference ?? fee.reference;
    await fee.save();

    return NextResponse.json({ fee });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await apiUser(req, ["admin"]);
    await dbConnect();
    await Fee.findByIdAndDelete(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
