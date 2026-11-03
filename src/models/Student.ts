import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const studentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    rollNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    registrationNo: { type: String, uppercase: true, trim: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    semester: { type: Number, required: true, min: 1, max: 8, index: true },
    batch: { type: String, trim: true },
    guardianName: { type: String, trim: true },
    guardianPhone: { type: String, trim: true },
    address: { type: String, default: "" },
    admissionYear: { type: Number },
  },
  { timestamps: true }
);

export type StudentDoc = InferSchemaType<typeof studentSchema>;

export const Student: Model<StudentDoc> =
  (models.Student as Model<StudentDoc>) || model<StudentDoc>("Student", studentSchema);
