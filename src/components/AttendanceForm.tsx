"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SubjectOption = { id: string; name: string; code: string; course: string; semester: number };
type Row = { id: string; name: string; rollNo: string; status: "present" | "absent" | "late" };

const today = () => new Date().toISOString().slice(0, 10);

export default function AttendanceForm({ subjects }: { subjects: SubjectOption[] }) {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const subject = subjects.find((s) => s.id === subjectId);

  useEffect(() => {
    if (!subject) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(`/api/students?course=${subject.course}&semester=${subject.semester}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list = (data.students ?? []).map((s: any) => ({
          id: String(s._id),
          name: s.user?.name ?? "Student",
          rollNo: s.rollNo,
          status: "present" as const,
        }));
        setRows(list);
      })
      .catch(() => setError("Could not load the class list."))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [subjectId]);

  function setStatus(id: string, status: Row["status"]) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  function markAll(status: Row["status"]) {
    setRows((prev) => prev.map((r) => ({ ...r, status })));
  }

  async function submit() {
    if (!subject) return;
    setLoading(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: subject.id,
        course: subject.course,
        semester: subject.semester,
        date,
        records: rows.map((r) => ({ student: r.id, status: r.status })),
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not save attendance.");
      return;
    }
    setMessage(`Attendance saved for ${rows.length} students.`);
    router.refresh();
  }

  if (subjects.length === 0) {
    return (
      <div className="card text-sm text-slate-600">
        No subjects are assigned to you yet. Ask the office to map a subject to your staff account.
      </div>
    );
  }

  const counts = {
    present: rows.filter((r) => r.status === "present").length,
    absent: rows.filter((r) => r.status === "absent").length,
    late: rows.filter((r) => r.status === "late").length,
  };

  return (
    <div className="space-y-5">
      <div className="card grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Subject</label>
          <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code}) · Sem {s.semester}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-secondary px-3 py-1 text-xs" onClick={() => markAll("present")}>
          All present
        </button>
        <button type="button" className="btn-secondary px-3 py-1 text-xs" onClick={() => markAll("absent")}>
          All absent
        </button>
        <span className="ml-auto text-xs text-slate-500">
          {counts.present} present · {counts.late} late · {counts.absent} absent
        </span>
      </div>

      <div className="table-wrap">
        <table className="table-base">
          <thead>
            <tr>
              <th>Roll no.</th>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-sm text-slate-500">Loading class list…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-sm text-slate-500">
                  No students enrolled in this course and semester.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td className="font-mono text-xs text-slate-600">{r.rollNo}</td>
                  <td className="font-medium text-slate-800">{r.name}</td>
                  <td>
                    <div className="flex gap-2">
                      {(["present", "late", "absent"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(r.id, s)}
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${
                            r.status === s
                              ? s === "present"
                                ? "bg-emerald-600 text-white"
                                : s === "late"
                                ? "bg-amber-500 text-white"
                                : "bg-rose-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {message ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

      <button type="button" className="btn-primary" disabled={loading || rows.length === 0} onClick={submit}>
        {loading ? "Saving…" : "Save attendance"}
      </button>
    </div>
  );
}
