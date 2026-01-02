import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/dbConnect";
import Application from "@/models/Application";
import Job from "@/models/Job";
import User from "@/models/User";
import Interest from "@/models/Interest";

export async function GET(req) {
  try {
    await connectDB();

    // Auth check
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get statistics
    const [totalJobs, totalApplications, totalStudents, recentApplications] = await Promise.all([
      Job.countDocuments(),
      Application.countDocuments(),
      User.countDocuments({ role: "student" }),
      Application.find()
        .populate("jobId", "company role")
        .populate("studentId", "name email")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // Get application count
    const appliedCount = await Application.countDocuments();

    // Get interested students who haven't applied
    // Find all unique students who are interested
    const allInterests = await Interest.find().select("studentId jobId");
    const allApplications = await Application.find().select("studentId jobId");
    
    // Create sets of student-job pairs
    const appliedPairs = new Set(
      allApplications.map(app => `${app.studentId}_${app.jobId}`)
    );
    
    // Count interests where student hasn't applied
    const interestedNotApplied = allInterests.filter(
      interest => !appliedPairs.has(`${interest.studentId}_${interest.jobId}`)
    ).length;

    // Get recent jobs
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("company role createdAt");

    return NextResponse.json({
      stats: {
        totalJobs,
        totalApplications,
        totalStudents,
        appliedCount,
        interestedNotApplied,
      },
      recentApplications,
      recentJobs,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

