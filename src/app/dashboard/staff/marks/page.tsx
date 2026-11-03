import { requireUser } from "@/lib/auth";
import { getStaffForUser, getStaffSubjects } from "@/lib/queries";
import { EmptyState, PageHeader } from "@/components/ui";
import MarksForm from "@/components/MarksForm";

export const dynamic = "force-dynamic";

export default async function StaffMarksPage() {
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
      <PageHeader title="Enter marks" subtitle="Marks are published to students as soon as you save." />
      <MarksForm subjects={options} />
    </div>
  );
}
