import bcrypt from "bcryptjs";
import { dbConnect } from "./db";
import { User } from "@/models/User";
import { Department } from "@/models/Department";
import { Course } from "@/models/Course";
import { Subject } from "@/models/Subject";
import { Student } from "@/models/Student";
import { Staff } from "@/models/Staff";
import { Attendance } from "@/models/Attendance";
import { Result } from "@/models/Result";
import { Fee } from "@/models/Fee";
import { Notice } from "@/models/Notice";

const PASSWORD = "Password@123";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Fills the database with a realistic demo college: departments, programmes,
 * subjects, one admin, three faculty members, six students, four weeks of
 * attendance, published results, fee records and notices.
 */
export async function seedDatabase() {
  await dbConnect();

  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Course.deleteMany({}),
    Subject.deleteMany({}),
    Student.deleteMany({}),
    Staff.deleteMany({}),
    Attendance.deleteMany({}),
    Result.deleteMany({}),
    Fee.deleteMany({}),
    Notice.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  /* ---------------------------------------------------------- departments */
  const [science, commerce, arts] = await Department.create([
    { name: "Science", code: "SCI", description: "Physical and life sciences" },
    { name: "Commerce", code: "COM", description: "Accounting, finance and business studies" },
    { name: "Arts", code: "ART", description: "Languages, history and social sciences" },
  ]);

  /* ------------------------------------------------------------- courses */
  const [bscCs, bcom, baEng] = await Course.create([
    {
      name: "B.Sc. Computer Science",
      code: "BSC-CS",
      department: science._id,
      level: "UG",
      durationYears: 3,
      totalSeats: 40,
      description: "Programming, data structures, databases and computer networks.",
    },
    {
      name: "B.Com. Honours",
      code: "BCOM-H",
      department: commerce._id,
      level: "UG",
      durationYears: 3,
      totalSeats: 80,
      description: "Financial accounting, taxation, cost accounting and business law.",
    },
    {
      name: "B.A. English Honours",
      code: "BA-ENG",
      department: arts._id,
      level: "UG",
      durationYears: 3,
      totalSeats: 60,
      description: "British and postcolonial literature, linguistics and academic writing.",
    },
  ]);

  /* ------------------------------------------------------------ subjects */
  const subjects = await Subject.create([
    { name: "Data Structures", code: "CS-101", course: bscCs._id, semester: 1, credits: 4 },
    { name: "Database Management Systems", code: "CS-201", course: bscCs._id, semester: 2, credits: 4 },
    { name: "Operating Systems", code: "CS-301", course: bscCs._id, semester: 3, credits: 4 },
    { name: "Financial Accounting", code: "CM-101", course: bcom._id, semester: 1, credits: 4 },
    { name: "Business Law", code: "CM-201", course: bcom._id, semester: 2, credits: 3 },
    { name: "British Literature", code: "EN-101", course: baEng._id, semester: 1, credits: 4 },
    { name: "Academic Writing", code: "EN-201", course: baEng._id, semester: 2, credits: 3 },
  ]);

  /* --------------------------------------------------------------- users */
  const [adminUser, staffUser1, staffUser2, staffUser3] = await User.create([
    { name: "Dr. Rupa Sen", email: "admin@mdc.edu.in", passwordHash, role: "admin", phone: "+91 98000 00001" },
    { name: "Prof. Anil Kumar", email: "staff@mdc.edu.in", passwordHash, role: "staff", phone: "+91 98000 00002" },
    { name: "Dr. Meera Ghosh", email: "meera@mdc.edu.in", passwordHash, role: "staff", phone: "+91 98000 00003" },
    { name: "Prof. Sanjay Dutta", email: "sanjay@mdc.edu.in", passwordHash, role: "staff", phone: "+91 98000 00004" },
  ]);

  const [staff1, staff2, staff3] = await Staff.create([
    {
      user: staffUser1._id,
      employeeId: "EMP-001",
      department: science._id,
      designation: "Associate Professor",
      qualification: "M.Tech, Computer Science",
      joinedOn: new Date("2015-06-01"),
    },
    {
      user: staffUser2._id,
      employeeId: "EMP-002",
      department: commerce._id,
      designation: "Assistant Professor",
      qualification: "M.Com, NET",
      joinedOn: new Date("2018-07-15"),
    },
    {
      user: staffUser3._id,
      employeeId: "EMP-003",
      department: arts._id,
      designation: "Assistant Professor",
      qualification: "M.A. English, PhD",
      joinedOn: new Date("2019-01-10"),
    },
  ]);

  // Map subjects to the teachers who take them
  const staffForSubject: Record<string, string> = {
    "CS-101": String(staff1._id),
    "CS-201": String(staff1._id),
    "CS-301": String(staff1._id),
    "CM-101": String(staff2._id),
    "CM-201": String(staff2._id),
    "EN-101": String(staff3._id),
    "EN-201": String(staff3._id),
  };
  for (const subject of subjects) {
    await Subject.findByIdAndUpdate(subject._id, { staff: staffForSubject[subject.code] });
  }

  /* ------------------------------------------------------------ students */
  const studentSeeds = [
    { name: "Arnab Roy", email: "student@mdc.edu.in", roll: "BSC/24/001", course: bscCs, sem: 2, dept: science },
    { name: "Priya Mondal", email: "priya@mdc.edu.in", roll: "BSC/24/002", course: bscCs, sem: 2, dept: science },
    { name: "Rahul Das", email: "rahul@mdc.edu.in", roll: "BSC/24/003", course: bscCs, sem: 2, dept: science },
    { name: "Sneha Barman", email: "sneha@mdc.edu.in", roll: "BCOM/24/001", course: bcom, sem: 1, dept: commerce },
    { name: "Imran Sheikh", email: "imran@mdc.edu.in", roll: "BCOM/24/002", course: bcom, sem: 1, dept: commerce },
    { name: "Tania Saha", email: "tania@mdc.edu.in", roll: "BA/24/001", course: baEng, sem: 1, dept: arts },
  ];

  const studentDocs: Array<{ _id: unknown; course: unknown; semester: number }> = [];
  for (const s of studentSeeds) {
    const user = await User.create({
      name: s.name,
      email: s.email,
      passwordHash,
      role: "student",
      phone: "+91 98000 1000" + studentDocs.length,
    });
    const student = await Student.create({
      user: user._id,
      rollNo: s.roll,
      registrationNo: s.roll.replace("/", "-"),
      course: s.course._id,
      department: s.dept._id,
      semester: s.sem,
      batch: "2024-27",
      guardianName: `${s.name.split(" ")[1]}'s guardian`,
      guardianPhone: "+91 98000 2000" + studentDocs.length,
      admissionYear: 2024,
    });
    studentDocs.push(student);
  }

  /* ---------------------------------------------------------- attendance */
  const classForCourse: Record<string, typeof studentDocs> = {};
  for (const student of studentDocs) {
    const key = String(student.course);
    if (!classForCourse[key]) classForCourse[key] = [];
    classForCourse[key].push(student);
  }

  let attendanceDays = 0;
  for (const subject of subjects) {
    const cohort = classForCourse[String(subject.course)] ?? [];
    if (cohort.length === 0) continue;

    for (let i = 1; i <= 12; i++) {
      const date = daysAgo(i * 2);
      const records = cohort.map((student, index) => {
        // Deterministic but varied attendance: most present, some absent.
        const seed = (i * 7 + index * 3) % 10;
        const status = seed === 0 ? "absent" : seed === 1 ? "late" : "present";
        return { student: student._id, status };
      });

      await Attendance.create({
        subject: subject._id,
        course: subject.course,
        semester: subject.semester,
        date,
        takenBy: subject.staff,
        records,
      });
      attendanceDays++;
    }
  }

  /* ------------------------------------------------------------- results */
  for (const subject of subjects) {
    const cohort = classForCourse[String(subject.course)] ?? [];
    for (const [index, student] of cohort.entries()) {
      await Result.create({
        student: student._id,
        subject: subject._id,
        semester: subject.semester,
        examType: "final",
        marksObtained: 58 + ((index * 9 + subject.credits * 3) % 38),
        maxMarks: 100,
        publishedBy: subject.staff,
      });
    }
  }

  /* ---------------------------------------------------------------- fees */
  for (const [index, student] of studentDocs.entries()) {
    await Fee.create([
      {
        student: student._id,
        title: "Admission & tuition fee",
        semester: student.semester,
        amount: 12500,
        paidAmount: 12500,
        status: "paid",
        paidOn: daysAgo(40),
        dueDate: daysAgo(45),
        reference: `TXN${1000 + index}`,
      },
      {
        student: student._id,
        title: "Semester examination fee",
        semester: student.semester,
        amount: 1800,
        paidAmount: index % 3 === 0 ? 1800 : 0,
        status: index % 3 === 0 ? "paid" : "pending",
        dueDate: daysAgo(-20),
      },
      {
        student: student._id,
        title: "Library & laboratory fee",
        semester: student.semester,
        amount: 2400,
        paidAmount: index % 2 === 0 ? 1200 : 0,
        status: index % 2 === 0 ? "partial" : "pending",
        dueDate: daysAgo(-10),
      },
    ]);
  }

  /* ------------------------------------------------------------- notices */
  await Notice.create([
    {
      title: "Semester examination schedule published",
      body:
        "The odd-semester examination routine for all programmes is now available at the examination counter and on the portal. Students must carry their admit card and college ID to every paper.",
      category: "exam",
      pinned: true,
      publishedBy: "Controller of Examinations",
    },
    {
      title: "Last date for fee payment",
      body:
        "Semester fees must be cleared before the 25th of this month. A late fine of ₹200 per week applies after the due date. Payments can be made at the accounts counter or online.",
      category: "fees",
      publishedBy: "Accounts Office",
    },
    {
      title: "Admission notice for the next academic session",
      body:
        "Applications for the 2026-27 undergraduate programmes open next month. Prospectus and forms will be available at the college office and on this website.",
      category: "admission",
      publishedBy: "Office of the Principal",
    },
    {
      title: "Annual cultural festival — registration open",
      body:
        "Register your team for the annual cultural festival by the end of this week. Events include debate, quiz, music and drama.",
      category: "event",
      publishedBy: "Students' Union",
    },
    {
      title: "Library timings extended during examinations",
      body:
        "The central library will remain open until 20:00 on all working days for the duration of the examination period.",
      category: "general",
      publishedBy: "Librarian",
    },
  ]);

  return {
    departments: 3,
    courses: 3,
    subjects: subjects.length,
    students: studentDocs.length,
    staff: 3,
    attendanceRegisters: attendanceDays,
    adminEmail: adminUser.email,
    staffEmail: staffUser1.email,
    studentEmail: "student@mdc.edu.in",
    password: PASSWORD,
  };
}
