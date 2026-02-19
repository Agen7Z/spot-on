import mongoose from "mongoose";

const cyclePreferencesSchema = new mongoose.Schema(
  {
    averageCycleLength: { type: Number, default: 28 },
    averagePeriodLength: { type: Number, default: 5 }
  },
  { _id: false }
);

const notificationSettingsSchema = new mongoose.Schema(
  {
    periodReminderDaysBefore: { type: Number, default: 2 },
    ovulationReminderDaysBefore: { type: Number, default: 2 },
    emailNotifications: { type: Boolean, default: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    cyclePreferences: { type: cyclePreferencesSchema, default: () => ({}) },
    notificationSettings: { type: notificationSettingsSchema, default: () => ({}) }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export default mongoose.model("User", userSchema);

