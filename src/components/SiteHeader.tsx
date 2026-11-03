import Link from "next/link";
import { site } from "@/config/site";
import { getSession } from "@/lib/auth";

export default async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            {site.shortName}
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-bold text-slate-900">{site.name}</span>
            <span className="block text-xs text-slate-500">{site.tagline}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-brand-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <Link href="/dashboard" className="btn-primary">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary hidden sm:inline-flex">
                Sign in
              </Link>
              <Link href="/login" className="btn-primary">
                Portal login
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
