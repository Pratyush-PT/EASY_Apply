import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/dbConnect";
import Interest from "@/models/Interest";
import Job from "@/models/Job";
import Application from "@/models/Application";
import User from "@/models/User";

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
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "student") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all jobs with deadlines
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const upcomingJobs = await Job.find({
      deadline: {
        $gte: now,
        $lte: tomorrow,
      },
    });

    // Get user's interests
    const interests = await Interest.find({
      studentId: user._id,
      notified: false,
    }).populate("jobId");

    // Get user's applications
    const applications = await Application.find({
      studentId: user._id,
    }).select("jobId");

    const appliedJobIds = new Set(applications.map((app) => app.jobId.toString()));

    // Filter interests for jobs with upcoming deadlines that user hasn't applied to
    const notifications = [];
    for (const interest of interests) {
      const job = interest.jobId;
      if (
        job &&
        job.deadline &&
        new Date(job.deadline) <= tomorrow &&
        new Date(job.deadline) >= now &&
        !appliedJobIds.has(job._id.toString())
      ) {
        notifications.push({
          jobId: job._id,
          company: job.company,
          role: job.role,
          deadline: job.deadline,
        });

        // Mark as notified
        interest.notified = true;
        await interest.save();
      }
    }

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Notification check error:", error);
    return NextResponse.json(
      { error: "Failed to check notifications" },
      { status: 500 }
    );
  }
}

