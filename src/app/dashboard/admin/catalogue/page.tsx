import { requireUser } from "@/lib/auth";
import { getCatalogue } from "@/lib/queries";
import { Badge, EmptyState, PageHeader, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminCataloguePage() {
  await requireUser(["admin"]);
  const { departments, courses, subjects } = await getCatalogue();

  return (
    <div>
      <PageHeader title="Catalogue" subtitle="Departments, programmes and subjects on record." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Departments" value={departments.length} />
        <StatCard label="Programmes" value={courses.length} />
        <StatCard label="Subjects" value={subjects.length} />
      </div>

      {courses.length === 0 ? (
        <EmptyState title="Catalogue is empty" hint="Run the seed script or add records through the API." />
      ) : (
        <div className="space-y-8">
          {departments.map((d) => {
            const deptCourses = courses.filter(
              (c) => String((c.department as unknown as { _id?: string })?._id ?? c.department) === String(d._id)
            );
            return (
              <section key={String(d._id)}>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {d.name} ({d.code})
                </h2>
                <div className="table-wrap">
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th>Programme</th>
                        <th>Code</th>
                        <th>Level</th>
                        <th>Duration</th>
                        <th>Subjects</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deptCourses.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-sm text-slate-500">No programmes yet.</td>
                        </tr>
                      ) : (
                        deptCourses.map((c) => (
                          <tr key={String(c._id)}>
                            <td className="font-medium text-slate-800">{c.name}</td>
                            <td className="font-mono text-xs text-slate-500">{c.code}</td>
                            <td><Badge tone="brand">{c.level}</Badge></td>
                            <td>{c.durationYears} years</td>
                            <td>{subjects.filter((s) => String(s.course) === String(c._id)).length}</td>
                          </tr>
                        ))
                      )}
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
