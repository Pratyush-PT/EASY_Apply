import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/dbConnect";
import Application from "@/models/Application";
import Job from "@/models/Job";   // ensures Job model is registered
import User from "@/models/User"; // ensures User model is registered

/**
 * GET /api/admin/applications
 * Admin: fetch all applications (sheet view)
 * Optional: ?jobId=<JOB_ID>
 */
export async function GET(req) {
  try {
    await connectDB();

    // 🔐 1️⃣ AUTH — admin only
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

    // 🔍 2️⃣ Optional filter by jobId
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    const query = jobId ? { jobId } : {};

    // 📊 3️⃣ Fetch applications (sheet rows)
    const applications = await Application.find(query)
      .populate({
        path: "jobId",
        select: "role company",
      })
      .populate({
        path: "studentId",
        select: "name email cgpa branch contact resumes",
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { applications },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin applications:", error);

    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
