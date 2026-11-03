import { requireUser } from "@/lib/auth";
import {
  getAttendanceSummary,
  getPublicNotices,
  getStudentFees,
  getStudentForUser,
  getStudentResults,
} from "@/lib/queries";
import { Badge, EmptyState, PageHeader, Progress, StatCard } from "@/components/ui";
import { formatDate, formatINR, percent } from "@/lib/utils";
import { gradeFor } from "@/config/site";

export const dynamic = "force-dynamic";

export default async function StudentOverview() {
  const user = await requireUser(["student"]);
  const student = await getStudentForUser(user.id);

  if (!student) {
    return (
      <EmptyState
        title="Your student record is not set up yet"
        hint="Please contact the college office so your roll number and course are linked to this account."
      />
    );
  }

  const [attendance, results, fees, notices] = await Promise.all([
    getAttendanceSummary(String(student._id)),
    getStudentResults(String(student._id)),
    getStudentFees(String(student._id)),
    getPublicNotices(3),
  ]);

  const totalClasses = attendance.reduce((sum, a) => sum + a.total, 0);
  const attended = attendance.reduce((sum, a) => sum + a.attended, 0);
  const overall = percent(attended, totalClasses);

  const scored = results.reduce((sum, r) => sum + r.marksObtained, 0);
  const possible = results.reduce((sum, r) => sum + r.maxMarks, 0);
  const average = percent(scored, possible);

  const due = fees.reduce((sum, f) => sum + Math.max(0, f.amount - f.paidAmount), 0);
  const course = student.course as unknown as { name?: string; code?: string } | undefined;

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user.name.split(" ")[0]}`}
        subtitle={`${course?.name ?? "Programme"} · Semester ${student.semester} · Roll ${student.rollNo}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Attendance"
          value={`${overall}%`}
          hint={`${attended} of ${totalClasses} classes`}
          tone={overall >= 75 ? "good" : overall >= 60 ? "warn" : "bad"}
        />
        <StatCard label="Average marks" value={`${average}%`} hint={`${results.length} papers on record`} />
        <StatCard label="Grade" value={gradeFor(average).grade} hint="Based on published results" />
        <StatCard
          label="Fees due"
          value={formatINR(due)}
          hint={due > 0 ? "Please clear before the due date" : "All dues cleared"}
          tone={due > 0 ? "warn" : "good"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Subject-wise attendance</h2>
          <div className="mt-4 space-y-4">
            {attendance.length === 0 ? (
              <p className="text-sm text-slate-500">No attendance recorded yet.</p>
            ) : (
              attendance.map((a) => {
                const p = percent(a.attended, a.total);
                return (
                  <div key={a.code}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800">{a.name}</span>
                      <span className={p >= 75 ? "text-emerald-600" : "text-amber-600"}>{p}%</span>
                    </div>
                    <Progress value={p} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recent notices</h2>
          <div className="mt-4 space-y-4">
            {notices.length === 0 ? (
              <p className="text-sm text-slate-500">No notices yet.</p>
            ) : (
              notices.map((n) => (
                <div key={String(n._id)} className="border-b border-slate-100 pb-3 last:border-0">
                  <div className="flex items-center gap-2">
                    <Badge tone="brand">{n.category}</Badge>
                    <span className="text-xs text-slate-400">{formatDate(n.createdAt as Date)}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-800">{n.title}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 card">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Profile</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: "Roll number", v: student.rollNo },
            { k: "Registration no.", v: student.registrationNo || "—" },
            { k: "Batch", v: student.batch || "—" },
            { k: "Guardian", v: student.guardianName || "—" },
            { k: "Guardian phone", v: student.guardianPhone || "—" },
            { k: "Email", v: user.email },
            { k: "Department", v: (student.department as unknown as { name?: string })?.name ?? "—" },
            { k: "Admitted", v: student.admissionYear ? String(student.admissionYear) : "—" },
          ].map((row) => (
            <div key={row.k}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{row.k}</dt>
              <dd className="text-sm text-slate-800">{row.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
