import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import Job from "@/models/Job";
import Application from "@/models/Application";
// student apply api build
export async function POST(req, { params }) {
  try {
    await connectDB();

    // Auth check
    const auth = req.headers.get("authorization");
    if (!auth) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch student
    const student = await User.findById(decoded.id);
    if (!student || student.role !== "student") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    //  Fetch job
    const job = await Job.findById(params.jobId);
    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

   //   Eligibility check (branch)
    if (!job.eligibleBranches.includes(student.branch)) {
      return Response.json(
        { error: "Not eligible for this job" },
        { status: 403 }
      );
    }

  // Read resume selection from body
    const { resumeUrl } = await req.json();
    if (!resumeUrl) {
      return Response.json(
        { error: "Resume is required" },
        { status: 400 }
      );
    }

    //  Prevent duplicate application
    const alreadyApplied = await Application.findOne({
      jobId: job._id,
      studentId: student._id,
    });

    if (alreadyApplied) {
      return Response.json(
        { error: "Already applied to this job" },
        { status: 409 }
      );
    }

    //  CREATE SNAPSHOT APPLICATION
    const application = await Application.create({
      jobId: job._id,
      studentId: student._id,

      // snapshot data
      name: student.name,
      email: student.email,
      contact: student.contact,
      cgpa: student.cgpa,
      branch: student.branch,
      resumeUrl,
    });

    return Response.json(
      { message: "Applied successfully", application },
      { status: 201 }
    );
  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
