import type { Metadata } from "next";
import { getPublicNotices } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Notices" };
export const dynamic = "force-dynamic";

const toneFor = (category: string) =>
  category === "exam" ? "amber" : category === "fees" ? "red" : category === "event" ? "green" : "brand";

export default async function NoticesPage() {
  let notices: Awaited<ReturnType<typeof getPublicNotices>> = [];
  try {
    notices = await getPublicNotices(50);
  } catch {
    // database not configured yet
  }

  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Notice board</h1>
      <p className="mt-2 text-sm text-slate-600">Examination, admission, fee and general circulars.</p>

      {notices.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No notices published yet.
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {notices.map((n) => (
            <article key={String(n._id)} className="card">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={toneFor(n.category) as "brand"}>{n.category}</Badge>
                {n.pinned ? <Badge tone="amber">pinned</Badge> : null}
                <span className="text-xs text-slate-400">{formatDate(n.createdAt as Date)}</span>
                <span className="text-xs text-slate-400">· {n.publishedBy}</span>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-slate-900">{n.title}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{n.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
