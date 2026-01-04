import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/dbConnect";
import Interest from "@/models/Interest";
import Application from "@/models/Application";
import User from "@/models/User";

async function getStudent(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    await connectDB();
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not configured");
      return null;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      console.error("User not found for ID:", decoded.id);
      return null;
    }
    // Only allow students to mark interests
    if (user.role !== "student") {
      console.error("User is not a student, role:", user.role);
      return null;
    }
    return user;
  } catch (error) {
    console.error("getStudent error:", error.message);
    return null;
  }
}

// POST - Mark interest in a job
export async function POST(req) {
  try {
    const student = await getStudent(req);
    if (!student) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in as a student." },
        { status: 401 }
      );
    }

    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Check if already interested
    const existingInterest = await Interest.findOne({
      jobId,
      studentId: student._id,
    });

    if (existingInterest) {
      return NextResponse.json({
        success: true,
        message: "Already marked as interested",
        interest: existingInterest,
      });
    }

    // 🛡️ ELIGIBILITY CHECKS
    const job = await import("@/models/Job").then((mod) =>
      mod.default.findById(jobId)
    );

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // 1. Profile Completion Check
    if (
      !student.resumes ||
      student.resumes.length === 0 ||
      !student.branch ||
      !student.cgpa ||
      !student.contact
    ) {
      return NextResponse.json(
        {
          error: "Please fill all the details in your profile page (Resume, Branch, CGPA, Contact) before marking interest.",
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
      !job.eligibleBranches.includes(student.branch)
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
    if (job.minCgpa && student.cgpa < job.minCgpa) {
      return NextResponse.json(
        {
          error: `You are not eligible: Minimum CGPA required is ${job.minCgpa}. Your CGPA is ${student.cgpa}.`,
        },
        { status: 400 }
      );
    }

    // Create interest
    const interest = await Interest.create({
      jobId,
      studentId: student._id,
    });

    return NextResponse.json({
      success: true,
      message: "Marked as interested",
      interest,
    });
  } catch (error) {
    console.error("Interest error:", error);
    return NextResponse.json(
      { error: "Failed to mark interest" },
      { status: 500 }
    );
  }
}

// GET - Get user's interests
export async function GET(req) {
  try {
    const student = await getStudent(req);
    if (!student) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in as a student." },
        { status: 401 }
      );
    }

    const interests = await Interest.find({ studentId: student._id }).select(
      "jobId createdAt"
    );

    return NextResponse.json({ interests });
  } catch (error) {
    console.error("Get interests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch interests" },
      { status: 500 }
    );
  }
}

// DELETE - Remove interest
export async function DELETE(req) {
  try {
    const student = await getStudent(req);
    if (!student) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in as a student." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    await Interest.findOneAndDelete({
      jobId,
      studentId: student._id,
    });

    return NextResponse.json({
      success: true,
      message: "Interest removed",
    });
  } catch (error) {
    console.error("Remove interest error:", error);
    return NextResponse.json(
      { error: "Failed to remove interest" },
      { status: 500 }
    );
  }
}

