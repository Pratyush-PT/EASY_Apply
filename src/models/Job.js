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
      type: String, // uploaded JD PDF
    },

    eligibleBranches: {
      type: [String], // ["CSE", "IT", "ECE"]
      required: true,
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

export default mongoose.models.Job ||
  mongoose.model("Job", JobSchema);
