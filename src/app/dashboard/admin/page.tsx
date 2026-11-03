import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getAdminOverview } from "@/lib/queries";
import { Badge, PageHeader, StatCard } from "@/components/ui";
import { formatDate, formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  await requireUser(["admin"]);
  const data = await getAdminOverview();

  return (
    <div>
      <PageHeader
        title="College overview"
        subtitle="Live counts from the portal database."
        action={
          <div className="flex gap-2">
            <Link href="/dashboard/admin/students" className="btn-primary">Manage students</Link>
            <Link href="/dashboard/admin/notices" className="btn-secondary">Post notice</Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={data.students} hint={`${data.users} accounts in total`} />
        <StatCard label="Faculty & staff" value={data.staff} />
        <StatCard label="Programmes" value={data.courses} />
        <StatCard
          label="Fees outstanding"
          value={formatINR(data.outstanding)}
          hint={`${data.pendingFees} unpaid records`}
          tone={data.outstanding > 0 ? "warn" : "good"}
        />
      </div>

      <div className="mt-6 card">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recent notices</h2>
          <Link href="/dashboard/admin/notices" className="text-xs font-semibold text-brand-700">Manage</Link>
        </div>
        <ul className="mt-4 space-y-3">
          {data.recentNotices.length === 0 ? (
            <li className="text-sm text-slate-500">Nothing published yet.</li>
          ) : (
            data.recentNotices.map((n) => (
              <li key={String(n._id)} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500">{n.publishedBy} · {formatDate(n.createdAt as Date)}</p>
                </div>
                <Badge tone="brand">{n.category}</Badge>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
