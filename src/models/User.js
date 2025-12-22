import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema({
  name: {
    type: String, // e.g. "SDE Resume", "Core Resume"
    required: true,
  },
  url: {
    type: String, // stored file URL
    required: true,
  },
  // uploadedAt: {
  //   type: Date,
  //   default: Date.now,
  // },
});

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    contact: {
      type: String,
    },

    cgpa: {
      type: Number,
      required: true,   
    },

    branch: {
      type: String,
      required: true,   
    },
    resumes: [ResumeSchema],
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
