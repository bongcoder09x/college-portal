import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const domain = site.email.split("@")[1];
  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Contact the college</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="text-base font-semibold text-slate-900">Office</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Address</dt>
              <dd className="text-slate-700">{site.address}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</dt>
              <dd className="text-slate-700">{site.phone}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt>
              <dd className="text-brand-700">{site.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hours</dt>
              <dd className="text-slate-700">Monday – Friday, 10:00 – 17:00 IST</dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <h2 className="text-base font-semibold text-slate-900">Who to write to</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li><span className="font-semibold text-slate-800">Admissions:</span> admission@{domain}</li>
            <li><span className="font-semibold text-slate-800">Examination cell:</span> exam@{domain}</li>
            <li><span className="font-semibold text-slate-800">Accounts:</span> accounts@{domain}</li>
            <li><span className="font-semibold text-slate-800">Portal support:</span> it@{domain}</li>
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-slate-500">
            For attendance, marks or fee corrections, raise the request through your department office so it
            is recorded against your roll number.
          </p>
        </div>
      </div>
    </div>
  );
}
