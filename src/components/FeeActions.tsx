"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FeeActions({ feeId, amount, paid }: { feeId: string; amount: number; paid: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [value, setValue] = useState(String(Math.max(0, amount - paid)));

  async function record() {
    setBusy(true);
    await fetch(`/api/fees/${feeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paidAmount: paid + Number(value) }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        className="input w-24 py-1 text-xs"
        value={value}
        min={0}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="button" className="btn-secondary px-2 py-1 text-xs" disabled={busy} onClick={record}>
        {busy ? "…" : "Record"}
      </button>
    </div>
  );
}
