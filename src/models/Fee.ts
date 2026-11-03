import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const feeSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    title: { type: String, required: true, trim: true },
    semester: { type: Number },
    amount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    dueDate: { type: Date },
    paidOn: { type: Date },
    status: { type: String, enum: ["pending", "partial", "paid"], default: "pending", index: true },
    reference: { type: String, trim: true },
  },
  { timestamps: true }
);

export type FeeDoc = InferSchemaType<typeof feeSchema>;

export const Fee: Model<FeeDoc> = (models.Fee as Model<FeeDoc>) || model<FeeDoc>("Fee", feeSchema);
