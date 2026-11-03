"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not sign you in.");
        setLoading(false);
        return;
      }

      const next = params.get("next");
      router.replace(next && next.startsWith("/dashboard") ? next : data.redirectTo);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  function fill(kind: "admin" | "staff" | "student") {
    const demo = {
      admin: "admin@mdc.edu.in",
      staff: "staff@mdc.edu.in",
      student: "student@mdc.edu.in",
    }[kind];
    setEmail(demo);
    setPassword("Password@123");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          className="input"
          placeholder="you@college.edu.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>
      ) : null}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <div className="rounded-lg bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Demo accounts</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => fill("student")} className="btn-secondary px-3 py-1 text-xs">
            Student
          </button>
          <button type="button" onClick={() => fill("staff")} className="btn-secondary px-3 py-1 text-xs">
            Faculty
          </button>
          <button type="button" onClick={() => fill("admin")} className="btn-secondary px-3 py-1 text-xs">
            Admin
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">Password for all demo accounts: Password@123</p>
      </div>
    </form>
  );
}
