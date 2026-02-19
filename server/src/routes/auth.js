import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }

    const existing = await User.findOne({
      $or: [{ email }, { username }]
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: existing.email === email ? "Email already in use" : "Username already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });
    const token = signToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        cyclePreferences: user.cyclePreferences,
        notificationSettings: user.notificationSettings
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        cyclePreferences: user.cyclePreferences,
        notificationSettings: user.notificationSettings
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

export default router;

