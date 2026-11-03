#!/usr/bin/env node
/**
 * Seeds demo data by calling the running app's /api/seed endpoint.
 * Start the app first (`npm run dev` or `npm start`), then run `npm run seed`.
 */
const base = process.env.APP_URL || "http://localhost:3000";
const token = process.env.SEED_TOKEN || "";

const res = await fetch(`${base}/api/seed`, {
  method: "POST",
  headers: { "x-seed-token": token },
});

const data = await res.json().catch(() => ({}));

if (!res.ok) {
  console.error("Seeding failed:", data.error ?? res.statusText);
  process.exit(1);
}

console.log("Database seeded.");
console.table(data.summary);
console.log("\nDemo logins (password for all: Password@123)");
console.log("  admin   -> admin@mdc.edu.in");
console.log("  faculty -> staff@mdc.edu.in");
console.log("  student -> student@mdc.edu.in");
