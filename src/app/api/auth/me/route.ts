import { apiUser, handleError } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const user = await apiUser(req);
    return NextResponse.json({ user });
  } catch (error) {
    return handleError(error);
  }
}
