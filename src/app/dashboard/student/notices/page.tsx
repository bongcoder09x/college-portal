import { requireUser } from "@/lib/auth";
import { getPublicNotices } from "@/lib/queries";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentNoticesPage() {
  await requireUser(["student"]);
  const notices = await getPublicNotices(50);

  return (
    <div>
      <PageHeader title="Notices" subtitle="Everything the office has published." />
      {notices.length === 0 ? (
        <EmptyState title="No notices yet" />
      ) : (
        <div className="space-y-3">
          {notices.map((n) => (
            <article key={String(n._id)} className="card">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">{n.category}</Badge>
                <span className="text-xs text-slate-400">{formatDate(n.createdAt as Date)}</span>
              </div>
              <h2 className="mt-2 font-semibold text-slate-900">{n.title}</h2>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{n.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
