import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "cp_session";
const ROLE_HOME: Record<string, string> = {
  admin: "/dashboard/admin",
  staff: "/dashboard/staff",
  student: "/dashboard/student",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "insecure-development-secret-change-me"
    );
    const { payload } = await jwtVerify(token, secret);
    const role = String(payload.role ?? "");

    // Each role may only open its own dashboard section.
    const section = pathname.split("/")[2];
    if (section && ["admin", "staff", "student"].includes(section) && section !== role) {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/dashboard", req.url));
    }

    return NextResponse.next();
  } catch {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    res.cookies.set({ name: COOKIE_NAME, value: "", path: "/", maxAge: 0 });
    return res;
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
