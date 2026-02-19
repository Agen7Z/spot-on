import mongoose from "mongoose";

const cycleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    cycleLength: { type: Number },
    predictedNextPeriod: { type: Date }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export default mongoose.model("Cycle", cycleSchema);

