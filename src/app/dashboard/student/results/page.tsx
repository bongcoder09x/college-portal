import { requireUser } from "@/lib/auth";
import { getStudentForUser, getStudentResults } from "@/lib/queries";
import { Badge, EmptyState, PageHeader, StatCard } from "@/components/ui";
import { percent } from "@/lib/utils";
import { gradeFor } from "@/config/site";

export const dynamic = "force-dynamic";

export default async function StudentResultsPage() {
  const user = await requireUser(["student"]);
  const student = await getStudentForUser(user.id);
  if (!student) return <EmptyState title="Student record not found" hint="Contact the college office." />;

  const results = await getStudentResults(String(student._id));
  const scored = results.reduce((s, r) => s + r.marksObtained, 0);
  const possible = results.reduce((s, r) => s + r.maxMarks, 0);
  const average = percent(scored, possible);

  const bySemester = new Map<number, typeof results>();
  for (const r of results) {
    if (!bySemester.has(r.semester)) bySemester.set(r.semester, []);
    bySemester.get(r.semester)!.push(r);
  }

  return (
    <div>
      <PageHeader title="Results" subtitle="Marks published by your subject teachers." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Papers" value={results.length} />
        <StatCard label="Aggregate" value={`${average}%`} hint={`${scored} / ${possible} marks`} />
        <StatCard label="Grade" value={gradeFor(average).grade} hint="Provisional" />
      </div>

      {results.length === 0 ? (
        <EmptyState title="No results published yet" hint="Marks appear here as soon as a teacher publishes them." />
      ) : (
        <div className="space-y-8">
          {[...bySemester.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([semester, rows]) => {
              const semScored = rows.reduce((s, r) => s + r.marksObtained, 0);
              const semPossible = rows.reduce((s, r) => s + r.maxMarks, 0);
              return (
                <section key={semester}>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Semester {semester}
                    </h2>
                    <span className="text-xs text-slate-500">{percent(semScored, semPossible)}%</span>
                  </div>
                  <div className="table-wrap">
                    <table className="table-base">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Exam</th>
                          <th className="text-right">Marks</th>
                          <th className="text-right">%</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => {
                          const subject = r.subject as unknown as { name?: string; code?: string } | undefined;
                          const p = percent(r.marksObtained, r.maxMarks);
                          const g = gradeFor(p);
                          return (
                            <tr key={String(r._id)}>
                              <td className="font-medium text-slate-800">{subject?.name ?? "—"}</td>
                              <td className="capitalize text-slate-500">{r.examType}</td>
                              <td className="text-right">{r.marksObtained} / {r.maxMarks}</td>
                              <td className="text-right">{p}%</td>
                              <td>
                                <Badge tone={g.grade === "F" ? "red" : "green"}>{g.grade}</Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
        </div>
      )}
    </div>
  );
}
