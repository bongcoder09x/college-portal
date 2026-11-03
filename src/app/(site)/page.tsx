import Link from "next/link";
import { site } from "@/config/site";
import { getCatalogue, getPublicNotices } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let notices: Awaited<ReturnType<typeof getPublicNotices>> = [];
  let catalogue: Awaited<ReturnType<typeof getCatalogue>> = { departments: [], courses: [], subjects: [] };

  try {
    [notices, catalogue] = await Promise.all([getPublicNotices(4), getCatalogue()]);
  } catch {
    // Database not configured yet — the marketing page still renders.
  }

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-[1.2fr_1fr] lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
              Established {site.established} · {site.affiliation}
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {site.name}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-50">
              A single place for admissions, courses, faculty, examination notices and the day-to-day
              academic record of every student on campus.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses" className="btn bg-white text-brand-700 hover:bg-brand-50">
                Explore courses
              </Link>
              <Link href="/login" className="btn border border-white/40 text-white hover:bg-white/10">
                Student &amp; staff login
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 self-center">
            {[
              { k: "Programmes", v: catalogue.courses.length || "—" },
              { k: "Departments", v: catalogue.departments.length || "—" },
              { k: "Subjects", v: catalogue.subjects.length || "—" },
              { k: "Notices", v: notices.length || "—" },
            ].map((s) => (
              <div key={s.k} className="rounded-xl border border-white/20 bg-white/10 p-4">
                <p className="text-2xl font-bold">{s.v}</p>
                <p className="text-xs uppercase tracking-wide text-brand-100">{s.k}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid gap-8 lg:grid-cols-3">
          {[
            {
              t: "Students",
              d: "See attendance subject by subject, marks and grade sheets, and every fee instalment with its due date.",
              href: "/login",
            },
            {
              t: "Faculty",
              d: "Mark attendance for a class in under a minute and publish marks as soon as they are moderated.",
              href: "/login",
            },
            {
              t: "Office",
              d: "Manage students, staff, programmes, fee records and notices from one admin console.",
              href: "/login",
            },
          ].map((c) => (
            <div key={c.t} className="card">
              <h3 className="text-lg font-semibold text-slate-900">{c.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.d}</p>
              <Link href={c.href} className="mt-4 inline-block text-sm font-semibold text-brand-700">
                Sign in →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold text-slate-900">Latest notices</h2>
          <Link href="/notices" className="text-sm font-semibold text-brand-700">
            View all
          </Link>
        </div>
        {notices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No notices published yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {notices.map((n) => (
              <article key={String(n._id)} className="card">
                <div className="flex items-center gap-2">
                  <Badge tone="brand">{n.category}</Badge>
                  <span className="text-xs text-slate-400">{formatDate(n.createdAt as Date)}</span>
                </div>
                <h3 className="mt-3 font-semibold text-slate-900">{n.title}</h3>
                <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-slate-600">{n.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
