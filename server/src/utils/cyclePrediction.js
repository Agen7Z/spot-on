import Cycle from "../models/Cycle.js";

export async function getPredictionForUser(userId) {
  const cycles = await Cycle.find({ userId }).sort({ startDate: -1 }).limit(24);
  if (!cycles.length) return null;

  // Get only completed cycles for accurate length calculation
  const completedCycles = cycles.filter((c) => c.cycleLength && c.cycleLength > 0);
  
  // Calculate average cycle length from completed cycles
  let avgCycleLength = 28; // default
  if (completedCycles.length >= 1) {
    const lengths = completedCycles.slice(0, 6).map((c) => c.cycleLength);
    avgCycleLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  }

  // Use last completed cycle, or last cycle overall for prediction start
  const lastCompleted = completedCycles.length > 0 ? completedCycles[0] : null;
  const lastCycle = cycles[0]; // most recent, regardless of completion
  
  // If we have a completed cycle, base prediction on it; otherwise use most recent
  const baseStart = lastCompleted ? new Date(lastCompleted.startDate) : new Date(lastCycle.startDate);

  // Calculate next period prediction
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let nextPeriodStart = new Date(baseStart);
  
  // Add full cycle length to get next prediction
  if (lastCompleted && lastCompleted.endDate) {
    // Use end date of last cycle as starting point for counting
    nextPeriodStart = new Date(lastCompleted.endDate);
    nextPeriodStart.setDate(nextPeriodStart.getDate() + 1); // next day after current period ends
    // Then add remaining days to complete the cycle
    const lastCycleLength = lastCompleted.cycleLength;
    const daysUsed = Math.floor((new Date(lastCompleted.endDate) - new Date(lastCompleted.startDate)) / (1000 * 60 * 60 * 24));
    nextPeriodStart.setDate(nextPeriodStart.getDate() + (avgCycleLength - daysUsed - 1));
  } else {
    // No cycles completed - just add average cycle length to last start
    nextPeriodStart = new Date(baseStart);
    nextPeriodStart.setDate(nextPeriodStart.getDate() + avgCycleLength);
  }

  // Ensure next period is in the future
  if (nextPeriodStart <= today) {
    nextPeriodStart = new Date(today);
    nextPeriodStart.setDate(nextPeriodStart.getDate() + 3); // default to 3 days from now if no data
  }

  const periodLength = 5; // standard period length
  const ovulationDate = new Date(nextPeriodStart);
  ovulationDate.setDate(ovulationDate.getDate() - 14); // ovulation is ~14 days before next period

  const fertileStart = new Date(ovulationDate);
  fertileStart.setDate(fertileStart.getDate() - 5);
  const fertileEnd = new Date(ovulationDate);
  fertileEnd.setDate(fertileEnd.getDate() + 1);

  // Current phase determination
  const daysSinceLastStart = Math.floor((today - baseStart) / (1000 * 60 * 60 * 24));
  let phase = "Unknown";
  if (daysSinceLastStart >= 0 && daysSinceLastStart <= periodLength) phase = "Menstrual";
  else if (daysSinceLastStart <= 12) phase = "Follicular";
  else if (daysSinceLastStart <= 16) phase = "Ovulation";
  else phase = "Luteal";

  return {
    nextPeriodStart,
    periodLength,
    cycleLength: avgCycleLength,
    ovulationDate,
    fertileStart,
    fertileEnd,
    phase,
    dayIndex: daysSinceLastStart,
    hasData: completedCycles.length > 0
  };
}

