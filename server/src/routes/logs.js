import express from "express";
import DailyLog from "../models/DailyLog.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authRequired, async (req, res) => {
  try {
    const { date, symptoms = [], mood = "", notes = "" } = req.body;
    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }

    const existing = await DailyLog.findOne({ userId: req.user.id, date: new Date(date) });
    if (existing) {
      existing.symptoms = symptoms;
      existing.mood = mood;
      existing.notes = notes;
      await existing.save();
      return res.json(existing);
    }

    const log = await DailyLog.create({
      userId: req.user.id,
      date: new Date(date),
      symptoms,
      mood,
      notes
    });
    res.status(201).json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save daily log" });
  }
});

router.get("/", authRequired, async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = { userId: req.user.id };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    const logs = await DailyLog.find(query).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

export default router;

