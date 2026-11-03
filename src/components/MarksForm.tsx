"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SubjectOption = { id: string; name: string; code: string; course: string; semester: number };
type Row = { id: string; name: string; rollNo: string; marks: string };

export default function MarksForm({ subjects }: { subjects: SubjectOption[] }) {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [examType, setExamType] = useState("final");
  const [maxMarks, setMaxMarks] = useState("100");
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
        setRows(
          (data.students ?? []).map((s: any) => ({
            id: String(s._id),
            name: s.user?.name ?? "Student",
            rollNo: s.rollNo,
            marks: "",
          }))
        );
      })
      .catch(() => setError("Could not load the class list."))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [subjectId]);

  async function submit() {
    if (!subject) return;
    const entries = rows
      .filter((r) => r.marks !== "")
      .map((r) => ({
        student: r.id,
        subject: subject.id,
        semester: subject.semester,
        examType,
        marksObtained: Number(r.marks),
        maxMarks: Number(maxMarks),
      }));

    if (entries.length === 0) {
      setError("Enter marks for at least one student.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not save marks.");
      return;
    }
    setMessage(`Saved marks for ${entries.length} students.`);
    router.refresh();
  }

  if (subjects.length === 0) {
    return <div className="card text-sm text-slate-600">No subjects are assigned to you yet.</div>;
  }

  return (
    <div className="space-y-5">
      <div className="card grid gap-4 sm:grid-cols-3">
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
          <label className="label">Exam</label>
          <select className="input" value={examType} onChange={(e) => setExamType(e.target.value)}>
            <option value="internal">Internal</option>
            <option value="midterm">Midterm</option>
            <option value="final">Final</option>
          </select>
        </div>
        <div>
          <label className="label">Maximum marks</label>
          <input
            type="number"
            className="input"
            value={maxMarks}
            min={1}
            onChange={(e) => setMaxMarks(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrap">
        <table className="table-base">
          <thead>
            <tr>
              <th>Roll no.</th>
              <th>Name</th>
              <th className="w-40">Marks</th>
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
              rows.map((r, index) => (
                <tr key={r.id}>
                  <td className="font-mono text-xs text-slate-600">{r.rollNo}</td>
                  <td className="font-medium text-slate-800">{r.name}</td>
                  <td>
                    <input
                      type="number"
                      className="input py-1"
                      min={0}
                      max={Number(maxMarks)}
                      value={r.marks}
                      placeholder="—"
                      onChange={(e) => {
                        const value = e.target.value;
                        setRows((prev) =>
                          prev.map((row, i) => (i === index ? { ...row, marks: value } : row))
                        );
                      }}
                    />
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
        {loading ? "Saving…" : "Publish marks"}
      </button>
    </div>
  );
}
