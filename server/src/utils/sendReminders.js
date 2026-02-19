import cron from "node-cron";
import nodemailer from "nodemailer";
import Reminder from "../models/Reminder.js";
import User from "../models/User.js";
import { getPredictionForUser } from "./cyclePrediction.js";
import dotenv from "dotenv";

dotenv.config();

let transporterPromise = null;

async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  // If SMTP env is provided, use it. Otherwise create an Ethereal test account for demo.
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporterPromise = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true" || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporterPromise;
  }

  // create test account (Ethereal) for demo
  transporterPromise = (async () => {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  })();

  return transporterPromise;
}

function parseTimeOfDay(t) {
  // expects HH:MM, returns {h, m}
  if (!t || typeof t !== "string") return { h: 20, m: 0 };
  const [hh, mm] = t.split(":");
  const h = parseInt(hh || "20", 10);
  const m = parseInt(mm || "0", 10);
  return { h, m };
}

function atSameMinute(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate() &&
    d1.getHours() === d2.getHours() &&
    d1.getMinutes() === d2.getMinutes()
  );
}

export function startReminders() {
  console.log("Reminder scheduler starting (runs every minute)");

  // run each minute
  const task = cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Load enabled reminders
      const reminders = await Reminder.find({ enabled: true });
      if (!reminders || reminders.length === 0) return;

      // Group by user to minimize DB calls
      const byUser = new Map();
      for (const r of reminders) {
        const key = String(r.userId);
        if (!byUser.has(key)) byUser.set(key, []);
        byUser.get(key).push(r);
      }

      const transporter = await getTransporter();

      for (const [userId, userRems] of byUser.entries()) {
        const user = await User.findById(userId).lean();
        if (!user || !user.email) continue;

        // get prediction for this user
        const pred = await getPredictionForUser(userId);
        if (!pred) continue; // no prediction yet

        for (const r of userRems) {
          let eventDate = null;
          if (r.type === "period") eventDate = new Date(pred.nextPeriodStart);
          else if (r.type === "ovulation") eventDate = new Date(pred.ovulationDate);
          if (!eventDate) continue;

          // compute notification datetime
          const notify = new Date(eventDate);
          notify.setDate(notify.getDate() - (r.daysBefore || 0));
          const { h, m } = parseTimeOfDay(r.timeOfDay || "20:00");
          notify.setHours(h, m, 0, 0);

          // If now matches notification minute, send
          if (atSameMinute(now, notify)) {
            // send email
            try {
              const subject = `Spot On — ${r.type === "period" ? "Period" : "Ovulation"} reminder`;
              const text = `Hi ${user.username || "there"},\n\nThis is a reminder: your predicted ${r.type} is on ${eventDate.toDateString()}.\n\nSent by Spot On.`;
              const html = `<p>Hi ${user.username || "there"},</p><p>This is a reminder: your predicted <strong>${r.type}</strong> is on <strong>${eventDate.toDateString()}</strong>.</p><p>— Spot On</p>`;

              const info = await transporter.sendMail({
                from: process.env.FROM_EMAIL || 'no-reply@spot-on.test',
                to: user.email,
                subject,
                text,
                html,
              });

              // If using Ethereal, log preview URL
              const preview = nodemailer.getTestMessageUrl(info);
              if (preview) console.log(`Reminder sent (preview): ${preview}`);
              else console.log(`Reminder sent to ${user.email} (id=${info.messageId})`);
            } catch (sendErr) {
              console.error("Failed to send reminder email", sendErr);
            }
          }
        }
      }
    } catch (err) {
      console.error("Reminder scheduler error", err);
    }
  });

  task.start();
  return task;
}
