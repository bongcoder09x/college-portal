"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";

export default function NoticeRow({
  id,
  title,
  body,
  category,
  pinned,
  date,
  author,
}: {
  id: string;
  title: string;
  body: string;
  category: string;
  pinned: boolean;
  date: string;
  author: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function togglePin() {
    setBusy(true);
    await fetch(`/api/notices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !pinned }),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this notice?")) return;
    setBusy(true);
    await fetch(`/api/notices/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <article className="card">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{category}</Badge>
        {pinned ? <Badge tone="amber">pinned</Badge> : null}
        <span className="text-xs text-slate-400">{date} · {author}</span>
        <div className="ml-auto flex gap-3 text-xs font-semibold">
          <button type="button" className="text-brand-700" disabled={busy} onClick={togglePin}>
            {pinned ? "Unpin" : "Pin"}
          </button>
          <button type="button" className="text-rose-600" disabled={busy} onClick={remove}>
            Delete
          </button>
        </div>
      </div>
      <h2 className="mt-2 font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{body}</p>
    </article>
  );
}
