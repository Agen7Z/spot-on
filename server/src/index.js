import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import cycleRoutes from "./routes/cycles.js";
import logRoutes from "./routes/logs.js";
import reminderRoutes from "./routes/reminders.js";
import aiRoutes from "./routes/ai.js";
import { startReminders } from "./utils/sendReminders.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "Spot On API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/cycles", cycleRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb+srv://spoton:spoton@cluster0.mvzjiy4.mongodb.net/spot_on";
const LOCAL_MONGODB_URI = "mongodb://localhost:27017/spot_on";

async function startServer() {
  // Try primary (likely Atlas) first, then fall back to local for development convenience
  try {
    console.log("Attempting MongoDB connection to:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB (primary)");
    // start background reminder scheduler
    try {
      startReminders();
    } catch (e) {
      console.error("Failed to start reminder scheduler", e);
    }
  } catch (errPrimary) {
    console.error("Primary MongoDB connection failed:", errPrimary.message || errPrimary);
    try {
      console.log("Attempting fallback local MongoDB at:", LOCAL_MONGODB_URI);
      await mongoose.connect(LOCAL_MONGODB_URI);
      console.log("Connected to MongoDB (local fallback)");
    } catch (errLocal) {
      console.error("Local MongoDB connection failed:", errLocal.message || errLocal);
      console.error("No MongoDB connections available. Please ensure Atlas network access or run a local MongoDB instance.");
      process.exit(1);
    }
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();

