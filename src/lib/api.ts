import { NextResponse } from "next/server";
import { COOKIE_NAME, readSession, type Role, type SessionUser } from "./auth";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function tokenFromRequest(req: Request) {
  const header = req.headers.get("cookie") || "";
  const part = header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  return part ? decodeURIComponent(part.slice(COOKIE_NAME.length + 1)) : null;
}

export async function apiUser(req: Request, roles?: Role[]): Promise<SessionUser> {
  const user = await readSession(tokenFromRequest(req));
  if (!user) throw new ApiError("You must be signed in.", 401);
  if (roles && !roles.includes(user.role)) throw new ApiError("You do not have access to this action.", 403);
  return user;
}

export function handleError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error && typeof error === "object" && "code" in error && (error as { code: number }).code === 11000) {
    return NextResponse.json({ error: "That record already exists (duplicate value)." }, { status: 409 });
  }
  console.error("[api]", error);
  const message = error instanceof Error ? error.message : "Unexpected server error";
  return NextResponse.json({ error: message }, { status: 500 });
}

export function requireFields(body: Record<string, unknown>, fields: string[]) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === "");
  if (missing.length) throw new ApiError(`Missing required field(s): ${missing.join(", ")}`, 422);
}
