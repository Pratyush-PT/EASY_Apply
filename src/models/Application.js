import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
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

    // SNAPSHOT DATA (copied at apply time)
    name: String,
    email: String,
    contact: String,
    cgpa: Number,
    branch: String,

    resumeUrl: String,

    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Rejected"],
      default: "Applied",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Application ||
  mongoose.model("Application", ApplicationSchema);
