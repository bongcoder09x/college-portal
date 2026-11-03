import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: {
    default: `${site.name} — Official Portal`,
    template: `%s | ${site.name}`,
  },
  description: `${site.name}: admissions, courses, faculty, notices, and the student and staff portal.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
