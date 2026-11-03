import { redirect } from "next/navigation";
import { getSession, ROLE_HOME } from "@/lib/auth";

export default async function DashboardIndex() {
  const session = await getSession();
  if (!session) redirect("/login");
  redirect(ROLE_HOME[session.role]);
}
