import mongoose from "mongoose";

const dailyLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    symptoms: [{ type: String }],
    mood: { type: String },
    notes: { type: String }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export default mongoose.model("DailyLog", dailyLogSchema);

