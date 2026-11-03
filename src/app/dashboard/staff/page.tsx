import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getStaffForUser, getStaffSubjects, getPublicNotices } from "@/lib/queries";
import { Badge, EmptyState, PageHeader, StatCard } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StaffOverview() {
  const user = await requireUser(["staff"]);
  const staff = await getStaffForUser(user.id);
  if (!staff) return <EmptyState title="Staff record not found" hint="Ask the office to link your employee ID." />;

  const [subjects, notices] = await Promise.all([
    getStaffSubjects(String(staff._id)),
    getPublicNotices(4),
  ]);

  const dept = staff.department as unknown as { name?: string } | undefined;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user.name.split(" ")[0]}`}
        subtitle={`${staff.designation} · ${dept?.name ?? "Department"} · ${staff.employeeId}`}
        action={
          <div className="flex gap-2">
            <Link href="/dashboard/staff/attendance" className="btn-primary">Mark attendance</Link>
            <Link href="/dashboard/staff/marks" className="btn-secondary">Enter marks</Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Subjects assigned" value={subjects.length} />
        <StatCard label="Semesters covered" value={new Set(subjects.map((s) => s.semester)).size} />
        <StatCard label="Notices live" value={notices.length} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Your subjects</h2>
          <ul className="mt-4 space-y-3">
            {subjects.length === 0 ? (
              <li className="text-sm text-slate-500">No subjects mapped to you yet.</li>
            ) : (
              subjects.map((s) => {
                const course = s.course as unknown as { name?: string } | undefined;
                return (
                  <li key={String(s._id)} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{s.name}</p>
                      <p className="text-xs text-slate-500">
                        {s.code} · {course?.name ?? "Course"} · Sem {s.semester}
                      </p>
                    </div>
                    <Badge>{s.credits} cr</Badge>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Latest notices</h2>
          <ul className="mt-4 space-y-3">
            {notices.map((n) => (
              <li key={String(n._id)} className="border-b border-slate-100 pb-2 last:border-0">
                <p className="text-sm font-medium text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500">{n.category} · {formatDate(n.createdAt as Date)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
