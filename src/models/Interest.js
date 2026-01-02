import mongoose from "mongoose";

const InterestSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    notified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure one interest per student per job
InterestSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

export default mongoose.models.Interest ||
  mongoose.model("Interest", InterestSchema);

