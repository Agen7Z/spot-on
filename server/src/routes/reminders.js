import express from "express";
import Reminder from "../models/Reminder.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authRequired, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id });
    res.json(reminders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reminders" });
  }
});

router.put("/", authRequired, async (req, res) => {
  try {
    const { reminders = [] } = req.body;
    const userId = req.user.id;

    await Reminder.deleteMany({ userId });
    const created = await Reminder.insertMany(
      reminders.map((r) => ({
        userId,
        type: r.type,
        daysBefore: typeof r.daysBefore === "number" ? r.daysBefore : 2,
        timeOfDay: r.timeOfDay || "20:00",
        method: r.method || "email",
        enabled: r.enabled !== false
      }))
    );

    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update reminders" });
  }
});

export default router;

