import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const courseSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    level: { type: String, enum: ["UG", "PG"], default: "UG" },
    durationYears: { type: Number, default: 3 },
    totalSeats: { type: Number, default: 50 },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export type CourseDoc = InferSchemaType<typeof courseSchema>;

export const Course: Model<CourseDoc> =
  (models.Course as Model<CourseDoc>) || model<CourseDoc>("Course", courseSchema);
