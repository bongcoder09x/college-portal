import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const recordSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    status: { type: String, enum: ["present", "absent", "late"], required: true },
  },
  { _id: false }
);

const attendanceSchema = new Schema(
  {
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    semester: { type: Number, required: true },
    date: { type: Date, required: true, index: true },
    takenBy: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
    records: { type: [recordSchema], default: [] },
  },
  { timestamps: true }
);

// One register per subject per day
attendanceSchema.index({ subject: 1, date: 1 }, { unique: true });

export type AttendanceDoc = InferSchemaType<typeof attendanceSchema>;

export const Attendance: Model<AttendanceDoc> =
  (models.Attendance as Model<AttendanceDoc>) ||
  model<AttendanceDoc>("Attendance", attendanceSchema);
