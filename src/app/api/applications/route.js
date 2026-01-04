import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/dbConnect";
import Application from "@/models/Application";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();

    //  Auth
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Body
    const { jobId, answers = {}, force = false } =
      await req.json();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    //  Check existing application
    const existingApplication = await Application.findOne({
      jobId,
      studentId: user._id,
    });

    //  Already applied & no reset confirmation
    if (existingApplication && !force) {
      return NextResponse.json(
        {
          error: "Already applied",
          alreadyApplied: true,
        },
        { status: 409 }
      );
    }

    //  Reset & overwrite existing application
    if (existingApplication && force) {
      existingApplication.name = user.name;
      existingApplication.email = user.email;
      existingApplication.branch = user.branch;
      existingApplication.cgpa = user.cgpa;
      existingApplication.answers = answers;
      existingApplication.status = "Applied";
      existingApplication.updatedAt = new Date();

      await existingApplication.save();

      return NextResponse.json(
        { success: true, application: existingApplication },
        { status: 200 }
      );
    }

    // First-time apply

    // 🛡️ ELIGIBILITY CHECKS
    const job = await import("@/models/Job").then((mod) =>
      mod.default.findById(jobId)
    );

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // 1. Profile Completion Check
    if (
      !user.resumes ||
      user.resumes.length === 0 ||
      !user.branch ||
      !user.cgpa ||
      !user.contact
    ) {
      return NextResponse.json(
        {
          error: "Please fill all the details in your profile page (Resume, Branch, CGPA, Contact) before applying.",
        },
        { status: 400 }
      );
    }

    // 2. Deadline Check
    if (job.deadline && new Date(job.deadline) < new Date()) {
      return NextResponse.json(
        { error: "You are not eligible: Application deadline has passed." },
        { status: 400 }
      );
    }

    // 3. Branch Eligibility Check
    if (
      job.eligibleBranches &&
      job.eligibleBranches.length > 0 &&
      !job.eligibleBranches.includes(user.branch)
    ) {
      return NextResponse.json(
        {
          error: `You are not eligible: This job is open for ${job.eligibleBranches.join(
            ", "
          )} branches only.`,
        },
        { status: 400 }
      );
    }

    // 4. CGPA Eligibility Check
    if (job.minCgpa && user.cgpa < job.minCgpa) {
      return NextResponse.json(
        {
          error: `You are not eligible: Minimum CGPA required is ${job.minCgpa}. Your CGPA is ${user.cgpa}.`,
        },
        { status: 400 }
      );
    }

    const application = await Application.create({
      jobId,
      studentId: user._id,

      // snapshot
      name: user.name,
      email: user.email,
      branch: user.branch,
      cgpa: user.cgpa,

      answers,
    });

    return NextResponse.json(
      { success: true, application },
      { status: 201 }
    );
  } catch (err) {
    console.error("APPLY ERROR 👉", err);
    return NextResponse.json(
      { error: "Failed to apply" },
      { status: 500 }
    );
  }
}
