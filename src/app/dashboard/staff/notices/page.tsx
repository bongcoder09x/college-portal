import { requireUser } from "@/lib/auth";
import { getPublicNotices } from "@/lib/queries";
import { PageHeader, Badge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import NoticeForm from "@/components/NoticeForm";

export const dynamic = "force-dynamic";

export default async function StaffNoticesPage() {
  const user = await requireUser(["staff"]);
  const notices = await getPublicNotices(50);

  return (
    <div>
      <PageHeader title="Notices" subtitle="Publish a circular to the notice board." />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {notices.length === 0 ? (
            <EmptyState title="No notices yet" />
          ) : (
            notices.map((n) => (
              <article key={String(n._id)} className="card">
                <div className="flex items-center gap-2">
                  <Badge tone="brand">{n.category}</Badge>
                  <span className="text-xs text-slate-400">{formatDate(n.createdAt as Date)}</span>
                </div>
                <h2 className="mt-2 font-semibold text-slate-900">{n.title}</h2>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{n.body}</p>
              </article>
            ))
          )}
        </div>
        <NoticeForm author={user.name} />
      </div>
    </div>
  );
}
