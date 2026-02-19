import express from "express";
import { authRequired } from "../middleware/auth.js";
import { getPredictionForUser } from "../utils/cyclePrediction.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/", authRequired, async (req, res) => {
  try {
    const { prompt = "" } = req.body;
    const userId = req.user.id;

    // If OpenAI key is present, proxy to OpenAI Chat Completions
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      const system = `You are Spot On assistant: provide helpful, empathetic, evidence-based explanations about menstrual cycles, predictions, ovulation, and logging. Keep answers concise and user-friendly.`;

      const messages = [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ];

      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({ model: "gpt-3.5-turbo", messages, max_tokens: 400 })
      });

      if (!resp.ok) {
        const txt = await resp.text();
        console.error("OpenAI error", txt);
        return res.status(502).json({ reply: "AI service error" });
      }

      const data = await resp.json();
      const reply = data?.choices?.[0]?.message?.content || "";
      return res.json({ reply });
    }

    // Fallback local assistant: richer rule-based responses using prediction
    const user = await User.findById(userId).lean();
    const pred = await getPredictionForUser(userId);

    const lower = prompt.toLowerCase();
    const today = new Date();

    const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "—");
    const daysBetween = (a, b) => Math.round((b - a) / (1000 * 60 * 60 * 24));

    // helper: safe default when no prediction
    const noPred = () => `I don't have enough cycle history to compute personalized dates. Try logging a few cycles and I'll be able to predict your next period and ovulation.`;

    let reply = "I'm here to help — ask about your next period, ovulation, cycle length, symptoms, or tracking tips.";

    // Keyword-based intent detection (prefer keywords before more general patterns)
    const hasKeyword = (words) => {
      const re = new RegExp("\\b(" + words.join("|") + ")\\b", "i");
      return re.test(prompt);
    };

    // Identity / author (keywords)
    if (hasKeyword(["who", "are", "you"]) && hasKeyword(["you"])) {
      if (/who\s+are\s+you/i.test(prompt) || /what\s+are\s+you/i.test(prompt)) return res.json({ reply: "I am the Spot On AI assistant." });
    }

    if (hasKeyword(["build", "built", "made", "developed", "creator", "author"])) {
      return res.json({ reply: "I was built by Dikshya." });
    }

    // Now handle date/intents: check period/fertile/ovulation keywords first
    if (hasKeyword(["period", "menstruation", "menses", "menstrual", "bleed"])) {
      if (pred && pred.nextPeriodStart) return res.json({ reply: fmt(pred.nextPeriodStart) });
      else return res.json({ reply: noPred() });
    }

    if (hasKeyword(["fertile", "fertility", "fertile window"])) {
      if (pred && pred.fertileStart && pred.fertileEnd) return res.json({ reply: `${fmt(pred.fertileStart)} - ${fmt(pred.fertileEnd)}` });
      else return res.json({ reply: noPred() });
    }

    if (hasKeyword(["ovulation", "ovulate", "ovulatory", "ovul"])) {
      if (pred && pred.ovulationDate) return res.json({ reply: fmt(pred.ovulationDate) });
      else return res.json({ reply: noPred() });
    }

    // Intent patterns
    if (/(when|date).*next.*period|next period when|next.*period\?/i.test(prompt) || (lower.includes("next period") && lower.includes("when"))) {
      if (pred && pred.nextPeriodStart) {
        const nd = new Date(pred.nextPeriodStart);
        const days = daysBetween(today.setHours(0,0,0,0), nd.setHours(0,0,0,0));
        reply = `Your next predicted period starts on ${fmt(pred.nextPeriodStart)} (${days} day${Math.abs(days) === 1 ? '' : 's'} from today).`;
      } else reply = noPred();

    } else if (/how many days.*until|days until.*period|count.*days.*until/i.test(prompt) || lower.includes("days until")) {
      if (pred && pred.nextPeriodStart) {
        const nd = new Date(pred.nextPeriodStart);
        const days = Math.max(0, daysBetween(new Date(today.toDateString()), nd));
        reply = `There are ${days} day${days === 1 ? '' : 's'} until your next predicted period on ${fmt(pred.nextPeriodStart)}.`;
      } else reply = noPred();

    } else if (lower.includes("ovulation") || lower.includes("fertile")) {
      if (pred && pred.ovulationDate) {
        reply = `Estimated ovulation: ${fmt(pred.ovulationDate)}. Fertile window: ${fmt(pred.fertileStart)} — ${fmt(pred.fertileEnd)}.`;
      } else reply = noPred();

    } else if (lower.includes("average cycle") || lower.includes("cycle length") || lower.includes("avg cycle")) {
      reply = `Your average cycle length is ${pred?.cycleLength || 28} days (based on recent data).`;

    } else if (lower.includes("period length") || /how long.*period/i.test(prompt)) {
      reply = `Typical period length for you is ${pred?.periodLength || 5} days. Period lengths vary; logging helps refine this.`;

    // Strict short-date responses for concise demo use
    } else if (/\b(period|menstruation|menses)\b/i.test(prompt)) {
      if (pred && pred.nextPeriodStart) return res.json({ reply: fmt(pred.nextPeriodStart) });
      else return res.json({ reply: noPred() });

    } else if (/\b(fertile|fertility|fertile window)\b/i.test(prompt)) {
      if (pred && pred.fertileStart && pred.fertileEnd) return res.json({ reply: `${fmt(pred.fertileStart)} - ${fmt(pred.fertileEnd)}` });
      else return res.json({ reply: noPred() });

    } else if (/\b(ovulation|ovulate|ovulatory|ovul)\b/i.test(prompt)) {
      if (pred && pred.ovulationDate) return res.json({ reply: fmt(pred.ovulationDate) });
      else return res.json({ reply: noPred() });

    } else if (lower.includes("missed period") || lower.includes("late period")) {
      reply = `A missed or late period can have many causes (stress, illness, medication, pregnancy, hormonal changes). If pregnancy is possible, consider taking a test and contact your healthcare provider for guidance.`;

    } else if (lower.includes("heavy") && lower.includes("bleed")) {
      reply = `Heavy bleeding (soaking through pads/tampons frequently) may need medical evaluation. If you experience dizziness, fainting, or very heavy bleeding, seek urgent care.`;

    } else if (lower.includes("how to track") || lower.includes("tracking")) {
      reply = `Good tracking tips: log start/end dates, flow intensity, symptoms (pain, mood, temperature), and any birth control. Regular logging improves predictions and helps spot changes.`;

    } else if (lower.includes("symptom") || lower.includes("bloating") || lower.includes("cramps") || lower.includes("pain")) {
      reply = `For cramps and bloating: rest, heat packs, gentle exercise, and over-the-counter pain relief can help. If symptoms are severe or worsening, consult a healthcare professional.`;

    } else {
      // Try more dynamic rephrasing using available data
      if (pred && pred.nextPeriodStart) {
        const nd = new Date(pred.nextPeriodStart);
        const days = Math.max(0, daysBetween(new Date(today.toDateString()), nd));
        reply = `Based on your data, your next period is predicted on ${fmt(pred.nextPeriodStart)} (${days} day${days === 1 ? '' : 's'} away). Ask me about ovulation, fertile window, or tracking tips.`;
      } else {
        reply = `I can help with predictions and advice, but I need more cycle logs to be accurate. Try adding recent cycle dates.`;
      }
    }

    // Friendly disclaimer
    reply += "\n\nNote: this assistant provides informational guidance and is not medical advice."

    return res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Assistant error" });
  }
});

export default router;
