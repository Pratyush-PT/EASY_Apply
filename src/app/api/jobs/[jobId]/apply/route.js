import { connectDB } from "@/lib/db";
import Job from "@/models/Job";
import Application from "@/models/Application";
import jwt from "jsonwebtoken";
import User from "@/models/User";

async function getUserFromRequest(req) {
  const token = req.cookies.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id);
  } catch (err) {
    return null;
  }
}


export async function POST(req, context) {
  try {
    await connectDB();

    const user = await getUserFromRequest(req);
    if (!user) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { jobId } = await context.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return Response.json(
        { message: "Job not found" },
        { status: 404 }
      );
    }
    // ❌ Branch eligibility check
    if (
      job.eligibleBranches &&
      job.eligibleBranches.length > 0 &&
      !job.eligibleBranches.includes(user.branch)
    ) {
      return Response.json(
        { message: "Not eligible: Branch not allowed" },
        { status: 403 }
      );
    }

    // ❌ CGPA eligibility check
    if (
      job.minCgpa !== null &&
      job.minCgpa !== undefined &&
      user.cgpa < job.minCgpa
    ) {
      return Response.json(
        { message: "Not eligible: CGPA below requirement" },
        { status: 403 }
      );
    }

    // ❌ Prevent duplicate applications
    const existing = await Application.findOne({
      jobId,
      studentId: user._id,
    });

    if (existing) {
      return Response.json(
        { message: "Already applied to this job" },
        { status: 409 }
      );
    }

    const application = await Application.create({
      jobId,
      studentId: user._id,
      company: job.company,
      role: job.role,
      resumeUrl: user.resumeUrl,
      cgpa: user.cgpa,
      appliedAt: new Date(),
    });

    return Response.json(
      { message: "Applied successfully", application },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
