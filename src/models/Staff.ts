import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const staffSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    designation: { type: String, default: "Assistant Professor", trim: true },
    qualification: { type: String, default: "", trim: true },
    joinedOn: { type: Date },
  },
  { timestamps: true }
);

export type StaffDoc = InferSchemaType<typeof staffSchema>;

export const Staff: Model<StaffDoc> =
  (models.Staff as Model<StaffDoc>) || model<StaffDoc>("Staff", staffSchema);
