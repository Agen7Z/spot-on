import express from "express";
import Cycle from "../models/Cycle.js";
import { authRequired } from "../middleware/auth.js";
import { getPredictionForUser } from "../utils/cyclePrediction.js";

const router = express.Router();

router.post("/", authRequired, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    if (!startDate) {
      return res.status(400).json({ message: "startDate is required" });
    }

    const start = new Date(startDate);
    let end = endDate ? new Date(endDate) : null;

    // If no end date provided, use a default 5-day period (typical period length)
    if (!end) {
      end = new Date(start);
      end.setDate(end.getDate() + 5); // assume 5 day period
    }

    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const cycle = new Cycle({
      userId: req.user.id,
      startDate: start,
      endDate: end,
      cycleLength: diffDays > 0 ? diffDays : 1
    });

    await cycle.save();
    res.status(201).json(cycle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create cycle" });
  }
});

router.get("/", authRequired, async (req, res) => {
  try {
    const cycles = await Cycle.find({ userId: req.user.id }).sort({ startDate: -1 });
    res.json(cycles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch cycles" });
  }
});

router.get("/prediction", authRequired, async (req, res) => {
  try {
    const prediction = await getPredictionForUser(req.user.id);
    if (!prediction) {
      return res.json(null);
    }
    res.json(prediction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to calculate prediction" });
  }
});

export default router;

