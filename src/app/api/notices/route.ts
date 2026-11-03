import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Notice } from "@/models/Notice";
import { apiUser, handleError, requireFields } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const notices = await Notice.find().sort({ pinned: -1, createdAt: -1 }).limit(50).lean();
    return NextResponse.json({ notices });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await apiUser(req, ["admin", "staff"]);
    const body = await req.json().catch(() => ({}));
    requireFields(body, ["title", "body"]);

    await dbConnect();
    const notice = await Notice.create({
      title: body.title,
      body: body.body,
      category: body.category || "general",
      pinned: Boolean(body.pinned),
      publishedBy: body.publishedBy || user.name,
    });
    return NextResponse.json({ notice }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
