import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSession, ROLE_HOME } from "@/lib/auth";
import { site } from "@/config/site";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(ROLE_HOME[session.role]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand-700 p-12 text-white lg:flex">
        <Link href="/" className="text-sm font-semibold text-brand-100">
          ← {site.name}
        </Link>
        <div>
          <h1 className="text-3xl font-bold leading-tight">One login for students, faculty and the office.</h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-100">
            Attendance, marks, grade sheets, fee records and notices — everything tied to your roll number
            or employee ID.
          </p>
        </div>
        <p className="text-xs text-brand-200">
          Trouble signing in? Write to it@{site.email.split("@")[1]}
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 inline-block text-sm text-slate-500 lg:hidden">
            ← Back to website
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to the portal</h2>
          <p className="mt-1 mb-6 text-sm text-slate-500">
            Use the email address issued by the college office.
          </p>
          <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
