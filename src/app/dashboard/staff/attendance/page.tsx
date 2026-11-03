import { requireUser } from "@/lib/auth";
import { getStaffForUser, getStaffSubjects } from "@/lib/queries";
import { EmptyState, PageHeader } from "@/components/ui";
import AttendanceForm from "@/components/AttendanceForm";

export const dynamic = "force-dynamic";

export default async function StaffAttendancePage() {
  const user = await requireUser(["staff"]);
  const staff = await getStaffForUser(user.id);
  if (!staff) return <EmptyState title="Staff record not found" />;

  const subjects = await getStaffSubjects(String(staff._id));
  const options = subjects.map((s) => ({
    id: String(s._id),
    name: s.name,
    code: s.code,
    course: String(s.course?._id ?? s.course),
    semester: s.semester,
  }));

  return (
    <div>
      <PageHeader title="Mark attendance" subtitle="Pick a subject and date, then save the register." />
      <AttendanceForm subjects={options} />
    </div>
  );
}
