import { requireUser } from "@/lib/auth";
import { getPublicNotices } from "@/lib/queries";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import NoticeForm from "@/components/NoticeForm";
import NoticeRow from "@/components/NoticeRow";

export const dynamic = "force-dynamic";

export default async function AdminNoticesPage() {
  const user = await requireUser(["admin"]);
  const notices = await getPublicNotices(50);

  return (
    <div>
      <PageHeader title="Notice board" subtitle="Publish, pin and remove circulars." />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {notices.length === 0 ? (
            <EmptyState title="No notices yet" />
          ) : (
            notices.map((n) => (
              <NoticeRow
                key={String(n._id)}
                id={String(n._id)}
                title={n.title}
                body={n.body}
                category={n.category}
                pinned={Boolean(n.pinned)}
                date={formatDate(n.createdAt as Date)}
                author={n.publishedBy}
              />
            ))
          )}
        </div>
        <NoticeForm author={user.name} />
      </div>
    </div>
  );
}
