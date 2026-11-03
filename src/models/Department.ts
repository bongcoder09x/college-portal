import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const departmentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export type DepartmentDoc = InferSchemaType<typeof departmentSchema>;

export const Department: Model<DepartmentDoc> =
  (models.Department as Model<DepartmentDoc>) ||
  model<DepartmentDoc>("Department", departmentSchema);
