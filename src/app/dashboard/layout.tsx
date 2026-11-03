import Link from "next/link";
import { requireUser, ROLE_LABEL, type Role } from "@/lib/auth";
import { site } from "@/config/site";
import DashboardNav from "@/components/DashboardNav";
import LogoutButton from "@/components/LogoutButton";

const NAV: Record<Role, { href: string; label: string }[]> = {
  student: [
    { href: "/dashboard/student", label: "Overview" },
    { href: "/dashboard/student/attendance", label: "Attendance" },
    { href: "/dashboard/student/results", label: "Results" },
    { href: "/dashboard/student/fees", label: "Fees" },
    { href: "/dashboard/student/notices", label: "Notices" },
  ],
  staff: [
    { href: "/dashboard/staff", label: "Overview" },
    { href: "/dashboard/staff/attendance", label: "Mark attendance" },
    { href: "/dashboard/staff/marks", label: "Enter marks" },
    { href: "/dashboard/staff/notices", label: "Notices" },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview" },
    { href: "/dashboard/admin/students", label: "Students" },
    { href: "/dashboard/admin/fees", label: "Fees" },
    { href: "/dashboard/admin/notices", label: "Notices" },
    { href: "/dashboard/admin/catalogue", label: "Catalogue" },
  ],
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-xs font-bold text-white">
              {site.shortName}
            </span>
            <span className="text-sm font-semibold text-slate-900">{site.name}</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold leading-tight text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{ROLE_LABEL[user.role]}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <DashboardNav items={NAV[user.role]} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
