import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const noticeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    category: {
      type: String,
      enum: ["general", "exam", "admission", "event", "fees"],
      default: "general",
    },
    pinned: { type: Boolean, default: false },
    publishedBy: { type: String, default: "Office of the Principal" },
  },
  { timestamps: true }
);

export type NoticeDoc = InferSchemaType<typeof noticeSchema>;

export const Notice: Model<NoticeDoc> =
  (models.Notice as Model<NoticeDoc>) || model<NoticeDoc>("Notice", noticeSchema);
