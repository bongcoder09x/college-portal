import type { Metadata } from "next";
import { getFacultyDirectory } from "@/lib/queries";

export const metadata: Metadata = { title: "Faculty" };
export const dynamic = "force-dynamic";

export default async function FacultyPage() {
  let faculty: Awaited<ReturnType<typeof getFacultyDirectory>> = [];
  try {
    faculty = await getFacultyDirectory();
  } catch {
    // database not configured yet
  }

  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Faculty directory</h1>
      <p className="mt-2 text-sm text-slate-600">Teaching staff by department.</p>

      {faculty.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Faculty records will appear here once the office adds them.
        </div>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {faculty.map((f) => {
            const user = f.user as unknown as { name?: string; email?: string } | undefined;
            const dept = f.department as unknown as { name?: string } | undefined;
            return (
              <div key={String(f._id)} className="card">
                <p className="text-base font-semibold text-slate-900">{user?.name ?? "Faculty member"}</p>
                <p className="text-xs text-slate-500">{f.designation}</p>
                <p className="mt-3 text-xs text-slate-600">{dept?.name ?? "—"}</p>
                {f.qualification ? <p className="text-xs text-slate-500">{f.qualification}</p> : null}
                {user?.email ? <p className="mt-2 text-xs text-brand-700">{user.email}</p> : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
