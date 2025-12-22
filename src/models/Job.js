import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    jdPdfUrl: {
      type: String,
    },

    eligibleBranches: {
      type: [String],
      required: true,
    },

    minCgpa: {
      type: Number,
    },

    deadline: {
      type: Date,
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * Force-delete cached model so schema updates apply
 */
if (mongoose.models.Job) {
  delete mongoose.models.Job;
}

export default mongoose.model("Job", JobSchema);
