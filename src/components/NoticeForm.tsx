"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NoticeForm({ author }: { author?: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const res = await fetch("/api/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, category, pinned, publishedBy: author }),
    });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error ?? "Could not publish the notice.");
      return;
    }
    setTitle("");
    setBody("");
    setPinned(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">New notice</h2>

      <div>
        <label className="label">Title</label>
        <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <label className="label">Details</label>
        <textarea
          className="input min-h-[120px]"
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <div>
        <label className="label">Category</label>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="general">General</option>
          <option value="exam">Examination</option>
          <option value="admission">Admission</option>
          <option value="fees">Fees</option>
          <option value="event">Event</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
        Pin to the top of the board
      </label>

      {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Publishing…" : "Publish notice"}
      </button>
    </form>
  );
}
