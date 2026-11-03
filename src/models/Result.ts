import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const resultSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    semester: { type: Number, required: true },
    examType: { type: String, enum: ["internal", "midterm", "final"], default: "final" },
    marksObtained: { type: Number, required: true, min: 0 },
    maxMarks: { type: Number, default: 100, min: 1 },
    publishedBy: { type: Schema.Types.ObjectId, ref: "Staff" },
  },
  { timestamps: true }
);

resultSchema.index({ student: 1, subject: 1, examType: 1 }, { unique: true });

export type ResultDoc = InferSchemaType<typeof resultSchema>;

export const Result: Model<ResultDoc> =
  (models.Result as Model<ResultDoc>) || model<ResultDoc>("Result", resultSchema);
