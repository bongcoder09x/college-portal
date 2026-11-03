import { requireUser } from "@/lib/auth";
import { getAttendanceSummary, getStudentForUser } from "@/lib/queries";
import { Badge, EmptyState, PageHeader, Progress } from "@/components/ui";
import { percent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentAttendancePage() {
  const user = await requireUser(["student"]);
  const student = await getStudentForUser(user.id);
  if (!student) return <EmptyState title="Student record not found" hint="Contact the college office." />;

  const rows = await getAttendanceSummary(String(student._id));
  const total = rows.reduce((s, r) => s + r.total, 0);
  const attended = rows.reduce((s, r) => s + r.attended, 0);
  const overall = percent(attended, total);

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle={`Semester ${student.semester} · minimum requirement is 75% per subject`}
      />

      <div className="mb-6 card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="card-title">Overall</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{overall}%</p>
            <p className="text-xs text-slate-500">{attended} of {total} classes attended</p>
          </div>
          <Badge tone={overall >= 75 ? "green" : overall >= 60 ? "amber" : "red"}>
            {overall >= 75 ? "Eligible" : "Shortage"}
          </Badge>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table-base">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Code</th>
              <th className="text-right">Held</th>
              <th className="text-right">Attended</th>
              <th className="w-48">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-slate-500">
                  No attendance has been recorded yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const p = percent(r.attended, r.total);
                return (
                  <tr key={r.code}>
                    <td className="font-medium text-slate-800">{r.name}</td>
                    <td className="text-slate-500">{r.code}</td>
                    <td className="text-right">{r.total}</td>
                    <td className="text-right">{r.attended}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Progress value={p} />
                        <span className="w-10 text-right text-xs font-semibold text-slate-600">{p}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
