import { requireUser } from "@/lib/auth";
import { getAllFees } from "@/lib/queries";
import { Badge, EmptyState, PageHeader, StatCard } from "@/components/ui";
import { formatDate, formatINR } from "@/lib/utils";
import FeeActions from "@/components/FeeActions";

export const dynamic = "force-dynamic";

export default async function AdminFeesPage() {
  await requireUser(["admin"]);
  const fees = await getAllFees();

  const billed = fees.reduce((s, f) => s + f.amount, 0);
  const collected = fees.reduce((s, f) => s + f.paidAmount, 0);
  const outstanding = Math.max(0, billed - collected);

  return (
    <div>
      <PageHeader title="Fee ledger" subtitle="Every bill raised against a student." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Billed" value={formatINR(billed)} />
        <StatCard label="Collected" value={formatINR(collected)} tone="good" />
        <StatCard label="Outstanding" value={formatINR(outstanding)} tone={outstanding > 0 ? "bad" : "good"} />
      </div>

      {fees.length === 0 ? (
        <EmptyState title="No fee records yet" hint="Bills appear here once they are raised for a student." />
      ) : (
        <div className="table-wrap">
          <table className="table-base">
            <thead>
              <tr>
                <th>Student</th>
                <th>Particulars</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Paid</th>
                <th>Due</th>
                <th>Status</th>
                <th>Record payment</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => {
                const student = f.student as unknown as
                  | { rollNo?: string; user?: { name?: string } }
                  | undefined;
                return (
                  <tr key={String(f._id)}>
                    <td>
                      <p className="text-sm font-medium text-slate-800">{student?.user?.name ?? "—"}</p>
                      <p className="font-mono text-xs text-slate-500">{student?.rollNo ?? ""}</p>
                    </td>
                    <td className="text-slate-700">{f.title}</td>
                    <td className="text-right">{formatINR(f.amount)}</td>
                    <td className="text-right">{formatINR(f.paidAmount)}</td>
                    <td className="text-xs text-slate-500">{formatDate(f.dueDate as Date)}</td>
                    <td>
                      <Badge tone={f.status === "paid" ? "green" : f.status === "partial" ? "amber" : "red"}>
                        {f.status}
                      </Badge>
                    </td>
                    <td>
                      {f.status === "paid" ? (
                        <span className="text-xs text-slate-400">settled</span>
                      ) : (
                        <FeeActions feeId={String(f._id)} amount={f.amount} paid={f.paidAmount} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
