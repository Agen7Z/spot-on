import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["period", "ovulation"], required: true },
      // how many days before the event to notify (0 = same day)
      daysBefore: { type: Number, default: 2 },
      // time of day to send notification in HH:MM (24h) e.g. "20:00"
      timeOfDay: { type: String, default: "20:00" },
      // delivery method, currently only 'email' supported
      method: { type: String, enum: ["email"], default: "email" },
      enabled: { type: Boolean, default: true }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export default mongoose.model("Reminder", reminderSchema);

