"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; label: string };

export default function StudentForm({
  courses,
  departments,
}: {
  courses: Option[];
  departments: Option[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "Password@123",
    phone: "",
    rollNo: "",
    registrationNo: "",
    course: courses[0]?.id ?? "",
    department: departments[0]?.id ?? "",
    semester: "1",
    batch: "",
    guardianName: "",
    guardianPhone: "",
    admissionYear: String(new Date().getFullYear()),
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, semester: Number(form.semester), admissionYear: Number(form.admissionYear) }),
    });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error ?? "Could not create the student.");
      return;
    }
    setOpen(false);
    setForm((prev) => ({ ...prev, name: "", email: "", rollNo: "", registrationNo: "", phone: "" }));
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
        Add student
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">New student</h2>
        <button type="button" className="text-xs text-slate-500 hover:text-slate-800" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Full name</label>
          <input className="input" required value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" required value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <label className="label">Roll number</label>
          <input className="input" required value={form.rollNo} onChange={(e) => set("rollNo", e.target.value)} />
        </div>
        <div>
          <label className="label">Registration no.</label>
          <input className="input" value={form.registrationNo} onChange={(e) => set("registrationNo", e.target.value)} />
        </div>
        <div>
          <label className="label">Programme</label>
          <select className="input" value={form.course} onChange={(e) => set("course", e.target.value)}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Department</label>
          <select className="input" value={form.department} onChange={(e) => set("department", e.target.value)}>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Semester</label>
          <select className="input" value={form.semester} onChange={(e) => set("semester", e.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Batch</label>
          <input className="input" placeholder="2024-27" value={form.batch} onChange={(e) => set("batch", e.target.value)} />
        </div>
        <div>
          <label className="label">Guardian name</label>
          <input className="input" value={form.guardianName} onChange={(e) => set("guardianName", e.target.value)} />
        </div>
        <div>
          <label className="label">Guardian phone</label>
          <input className="input" value={form.guardianPhone} onChange={(e) => set("guardianPhone", e.target.value)} />
        </div>
        <div>
          <label className="label">Temporary password</label>
          <input className="input" value={form.password} onChange={(e) => set("password", e.target.value)} />
        </div>
        <div>
          <label className="label">Admission year</label>
          <input className="input" value={form.admissionYear} onChange={(e) => set("admissionYear", e.target.value)} />
        </div>
      </div>

      {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? "Creating…" : "Create student account"}
      </button>
    </form>
  );
}
