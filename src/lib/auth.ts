import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

export type Role = "admin" | "staff" | "student";

export const COOKIE_NAME = "cp_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const ROLE_HOME: Record<Role, string> = {
  admin: "/dashboard/admin",
  staff: "/dashboard/staff",
  student: "/dashboard/student",
};

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrator",
  staff: "Faculty / Staff",
  student: "Student",
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

function secretKey() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET || "insecure-development-secret-change-me"
  );
}

export async function signSession(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function readSession(token?: string | null): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.id || !payload.role) return null;
    return {
      id: String(payload.id),
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  return readSession(cookies().get(COOKIE_NAME)?.value);
}

/** For server components: bounce to login, or to the user's own dashboard if the role is wrong. */
export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect(ROLE_HOME[user.role]);
  return user;
}
