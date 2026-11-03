import mongoose from "mongoose";
import { dbConnect } from "./db";
import { Notice } from "@/models/Notice";
import { Course } from "@/models/Course";
import { Department } from "@/models/Department";
import { Subject } from "@/models/Subject";
import { Student } from "@/models/Student";
import { Staff } from "@/models/Staff";
import { Attendance } from "@/models/Attendance";
import { Result } from "@/models/Result";
import { Fee } from "@/models/Fee";
import { User } from "@/models/User";

const oid = (id: string) => new mongoose.Types.ObjectId(id);

/* ------------------------------------------------------------------ public */

export async function getPublicNotices(limit = 20) {
  await dbConnect();
  return Notice.find().sort({ pinned: -1, createdAt: -1 }).limit(limit).lean();
}

export async function getCatalogue() {
  await dbConnect();
  const [departments, courses, subjects] = await Promise.all([
    Department.find().sort({ name: 1 }).lean(),
    Course.find().populate("department", "name code").sort({ name: 1 }).lean(),
    Subject.find().select("name code course semester credits").sort({ semester: 1 }).lean(),
  ]);
  return { departments, courses, subjects };
}

export async function getFacultyDirectory() {
  await dbConnect();
  return Staff.find()
    .populate("user", "name email")
    .populate("department", "name code")
    .sort({ employeeId: 1 })
    .lean();
}

/* ----------------------------------------------------------------- student */

export async function getStudentForUser(userId: string) {
  await dbConnect();
  return Student.findOne({ user: oid(userId) })
    .populate("user", "name email phone")
    .populate("course", "name code durationYears")
    .populate("department", "name code")
    .lean();
}

export async function getAttendanceSummary(studentId: string) {
  await dbConnect();
  const rows = await Attendance.aggregate([
    { $unwind: "$records" },
    { $match: { "records.student": oid(studentId) } },
    {
      $group: {
        _id: "$subject",
        total: { $sum: 1 },
        attended: {
          $sum: { $cond: [{ $in: ["$records.status", ["present", "late"]] }, 1, 0] },
        },
      },
    },
    {
      $lookup: { from: "subjects", localField: "_id", foreignField: "_id", as: "subject" },
    },
    { $unwind: "$subject" },
    {
      $project: {
        _id: 0,
        subjectId: "$_id",
        name: "$subject.name",
        code: "$subject.code",
        total: 1,
        attended: 1,
      },
    },
    { $sort: { name: 1 } },
  ]);
  return rows as { subjectId: string; name: string; code: string; total: number; attended: number }[];
}

export async function getStudentResults(studentId: string) {
  await dbConnect();
  return Result.find({ student: oid(studentId) })
    .populate("subject", "name code credits semester")
    .sort({ semester: 1 })
    .lean();
}

export async function getStudentFees(studentId: string) {
  await dbConnect();
  return Fee.find({ student: oid(studentId) }).sort({ dueDate: 1 }).lean();
}

/* ------------------------------------------------------------------- staff */

export async function getStaffForUser(userId: string) {
  await dbConnect();
  return Staff.findOne({ user: oid(userId) })
    .populate("user", "name email phone")
    .populate("department", "name code")
    .lean();
}

export async function getStaffSubjects(staffId: string) {
  await dbConnect();
  return Subject.find({ staff: oid(staffId) })
    .populate("course", "name code")
    .sort({ semester: 1, name: 1 })
    .lean();
}

export async function getStudentsForCourse(courseId: string, semester: number) {
  await dbConnect();
  return Student.find({ course: oid(courseId), semester })
    .populate("user", "name email")
    .sort({ rollNo: 1 })
    .lean();
}

/* ------------------------------------------------------------------- admin */

export async function getAdminOverview() {
  await dbConnect();
  const [students, staff, courses, notices, users, dues, recentNotices] = await Promise.all([
    Student.countDocuments(),
    Staff.countDocuments(),
    Course.countDocuments(),
    Notice.countDocuments(),
    User.countDocuments(),
    Fee.aggregate([
      { $match: { status: { $ne: "paid" } } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: { $subtract: ["$amount", "$paidAmount"] } },
        },
      },
    ]),
    Notice.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  return {
    students,
    staff,
    courses,
    notices,
    users,
    pendingFees: dues[0]?.count ?? 0,
    outstanding: dues[0]?.amount ?? 0,
    recentNotices,
  };
}

export async function getAllStudents() {
  await dbConnect();
  return Student.find()
    .populate("user", "name email isActive")
    .populate("course", "name code")
    .sort({ rollNo: 1 })
    .lean();
}

export async function getAllFees() {
  await dbConnect();
  return Fee.find()
    .populate({ path: "student", select: "rollNo user", populate: { path: "user", select: "name" } })
    .sort({ dueDate: 1 })
    .lean();
}

export async function getAllUsers() {
  await dbConnect();
  return User.find().sort({ role: 1, name: 1 }).limit(300).lean();
}
