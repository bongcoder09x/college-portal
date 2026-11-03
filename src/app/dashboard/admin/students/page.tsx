import { requireUser } from "@/lib/auth";
import { getAllStudents, getCatalogue } from "@/lib/queries";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import StudentForm from "@/components/StudentForm";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  await requireUser(["admin"]);
  const [students, catalogue] = await Promise.all([getAllStudents(), getCatalogue()]);

  const courseOptions = catalogue.courses.map((c) => ({ id: String(c._id), label: `${c.name} (${c.code})` }));
  const deptOptions = catalogue.departments.map((d) => ({ id: String(d._id), label: d.name }));

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${students.length} records`}
        action={<StudentForm courses={courseOptions} departments={deptOptions} />}
      />

      {courseOptions.length === 0 ? (
        <EmptyState
          title="Add a programme first"
          hint="A student needs a course. Seed the database or add courses from the catalogue page."
        />
      ) : students.length === 0 ? (
        <EmptyState title="No students yet" hint="Use the Add student button to create the first account." />
      ) : (
        <div className="table-wrap">
          <table className="table-base">
            <thead>
              <tr>
                <th>Roll no.</th>
                <th>Name</th>
                <th>Programme</th>
                <th>Sem</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const user = s.user as unknown as { name?: string; email?: string; isActive?: boolean } | undefined;
                const course = s.course as unknown as { name?: string } | undefined;
                return (
                  <tr key={String(s._id)}>
                    <td className="font-mono text-xs text-slate-600">{s.rollNo}</td>
                    <td className="font-medium text-slate-800">{user?.name ?? "—"}</td>
                    <td className="text-slate-600">{course?.name ?? "—"}</td>
                    <td>{s.semester}</td>
                    <td className="text-xs text-slate-500">{user?.email ?? "—"}</td>
                    <td>
                      <Badge tone={user?.isActive === false ? "red" : "green"}>
                        {user?.isActive === false ? "inactive" : "active"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
