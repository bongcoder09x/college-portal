import Link from "next/link";
import { site } from "@/config/site";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm font-bold text-slate-900">{site.name}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Established {site.established}. {site.affiliation}.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Campus</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">{site.address}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</p>
          <p className="mt-2 text-xs text-slate-600">{site.phone}</p>
          <p className="text-xs text-slate-600">{site.email}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick links</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            <li><Link href="/courses" className="hover:text-brand-700">Courses offered</Link></li>
            <li><Link href="/notices" className="hover:text-brand-700">Notices</Link></li>
            <li><Link href="/login" className="hover:text-brand-700">Student &amp; staff login</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4">
        <p className="container-page text-xs text-slate-400">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
