import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Application from "@/models/Application";
import Job from "@/models/Job";     // registers Job model
import User from "@/models/User";   // registers User model

/**
 * GET /api/admin/applications
 * Admin: fetch all job applications
 */
export async function GET() {
  try {
    await connectDB();

    const applications = await Application.find()
      .populate({
        path: "jobId",               // ✅ matches schema
        select: "role company",
      })
      .populate({
        path: "studentId",           // ✅ FIXED (NOT user / userId)
        select: "name email",
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { applications },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin applications:", error);

    return NextResponse.json(
      { message: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
