import type { Metadata } from "next";
import { getCatalogue } from "@/lib/queries";
import { Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Courses offered" };
export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  let catalogue: Awaited<ReturnType<typeof getCatalogue>> = { departments: [], courses: [], subjects: [] };
  try {
    catalogue = await getCatalogue();
  } catch {
    // database not configured yet
  }

  const subjectsByCourse = new Map<string, typeof catalogue.subjects>();
  for (const s of catalogue.subjects) {
    const key = String(s.course);
    if (!subjectsByCourse.has(key)) subjectsByCourse.set(key, []);
    subjectsByCourse.get(key)!.push(s);
  }

  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Courses offered</h1>
      <p className="mt-2 text-sm text-slate-600">
        Programmes run by {catalogue.departments.length} departments across undergraduate and postgraduate levels.
      </p>

      {catalogue.courses.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Course catalogue is being updated. Please check back shortly.
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {catalogue.courses.map((c) => {
            const dept = c.department as unknown as { name?: string; code?: string } | undefined;
            const subjects = subjectsByCourse.get(String(c._id)) ?? [];
            return (
              <article key={String(c._id)} className="card">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">{c.name}</h2>
                  <Badge tone="brand">{c.level}</Badge>
                </div>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  {c.code} · {dept?.name ?? "Department"} · {c.durationYears} years
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{c.description}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {subjects.length} subjects on record
                </p>
                {subjects.length > 0 ? (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {subjects.slice(0, 8).map((s) => (
                      <li key={String(s._id)} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                        {s.name}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
