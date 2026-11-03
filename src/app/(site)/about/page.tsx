import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "About the college" };

export default function AboutPage() {
  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">About {site.name}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600">
        Founded in {site.established}, {site.name} is a degree college {site.affiliation.toLowerCase()}.
        The college runs undergraduate and postgraduate programmes across the sciences, humanities and
        commerce, supported by laboratories, a central library and a dedicated faculty.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          {
            t: "Our mission",
            d: "To make quality higher education affordable and accessible to students from the district and beyond, with a focus on steady academic mentoring.",
          },
          {
            t: "Academics",
            d: "Semester-based curricula, continuous internal assessment, and a published examination calendar for every programme.",
          },
          {
            t: "Campus life",
            d: "Departmental societies, an annual cultural festival, sports facilities and an active NSS unit.",
          },
        ].map((b) => (
          <div key={b.t} className="card">
            <h2 className="text-base font-semibold text-slate-900">{b.t}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{b.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 card">
        <h2 className="text-base font-semibold text-slate-900">Visiting us</h2>
        <p className="mt-2 text-sm text-slate-600">{site.address}</p>
        <p className="mt-1 text-sm text-slate-600">Office hours: Monday to Friday, 10:00 – 17:00 IST</p>
      </div>
    </div>
  );
}
