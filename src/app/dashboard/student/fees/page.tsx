import { requireUser } from "@/lib/auth";
import { getStudentFees, getStudentForUser } from "@/lib/queries";
import { Badge, EmptyState, PageHeader, StatCard } from "@/components/ui";
import { formatDate, formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentFeesPage() {
  const user = await requireUser(["student"]);
  const student = await getStudentForUser(user.id);
  if (!student) return <EmptyState title="Student record not found" hint="Contact the college office." />;

  const fees = await getStudentFees(String(student._id));
  const billed = fees.reduce((s, f) => s + f.amount, 0);
  const paid = fees.reduce((s, f) => s + f.paidAmount, 0);
  const due = Math.max(0, billed - paid);

  return (
    <div>
      <PageHeader title="Fees" subtitle="Every instalment billed against your roll number." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total billed" value={formatINR(billed)} />
        <StatCard label="Paid" value={formatINR(paid)} tone="good" />
        <StatCard label="Outstanding" value={formatINR(due)} tone={due > 0 ? "bad" : "good"} />
      </div>

      {fees.length === 0 ? (
        <EmptyState title="No fee records yet" hint="The accounts office has not raised any bill for this account." />
      ) : (
        <div className="table-wrap">
          <table className="table-base">
            <thead>
              <tr>
                <th>Particulars</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Paid</th>
                <th>Due date</th>
                <th>Paid on</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={String(f._id)}>
                  <td className="font-medium text-slate-800">
                    {f.title}
                    {f.semester ? <span className="ml-2 text-xs text-slate-400">Sem {f.semester}</span> : null}
                  </td>
                  <td className="text-right">{formatINR(f.amount)}</td>
                  <td className="text-right">{formatINR(f.paidAmount)}</td>
                  <td>{formatDate(f.dueDate as Date)}</td>
                  <td>{formatDate(f.paidOn as Date)}</td>
                  <td>
                    <Badge tone={f.status === "paid" ? "green" : f.status === "partial" ? "amber" : "red"}>
                      {f.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
