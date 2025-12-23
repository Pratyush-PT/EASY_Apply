import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";
import Application from "@/models/Application";
import User from "@/models/User";
import jwt from "jsonwebtoken";

async function getUserFromRequest(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id);
  } catch {
    return null;
  }
}

export async function POST(req, context) {
  try {
    await connectDB();

    //  Auth
    const user = await getUserFromRequest(req);
    if (!user) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ IMPORTANT FIX (Next.js App Router)
    const { jobId } = await context.params;

    // ✅ IMPORTANT FIX (await DB call)
    const job = await Job.findById(jobId);

    if (!job) {
      return Response.json(
        { message: "Job not found" },
        { status: 404 }
      );
    }

    // ❌ Branch eligibility
    if (
      job.eligibleBranches?.length > 0 &&
      !job.eligibleBranches.includes(user.branch)
    ) {
      return Response.json(
        { message: "Not eligible: Branch not allowed" },
        { status: 403 }
      );
    }

    // ❌ CGPA eligibility
    if (
      job.minCgpa !== null &&
      job.minCgpa !== undefined &&
      Number(user.cgpa) < Number(job.minCgpa)
    ) {
      return Response.json(
        { message: "Not eligible: CGPA below requirement" },
        { status: 403 }
      );
    }

    // ❌ Duplicate application
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

    // ✅ Create application
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
