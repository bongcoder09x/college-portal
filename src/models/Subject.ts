import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const subjectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    credits: { type: Number, default: 4 },
    staff: { type: Schema.Types.ObjectId, ref: "Staff" },
  },
  { timestamps: true }
);

export type SubjectDoc = InferSchemaType<typeof subjectSchema>;

export const Subject: Model<SubjectDoc> =
  (models.Subject as Model<SubjectDoc>) || model<SubjectDoc>("Subject", subjectSchema);
