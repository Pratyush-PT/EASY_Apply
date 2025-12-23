import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Application from "@/models/Application";
import User from "@/models/User";

export async function POST(req, { params }) {
  try {
    await connectDB();

    const { jobId } = params;
    const { studentId, resumeUrl } = await req.json();

    // ✅ THIS IS THE CODE YOU ASKED ABOUT
    const student = await User.findById(studentId);

    await Application.create({
      jobId,
      studentId,

      // ✅ SNAPSHOT DATA (VERY IMPORTANT)
      name: student.name,
      email: student.email,
      contact: student.contact,
      cgpa: student.cgpa,
      branch: student.branch,

      resumeUrl,
    });

    return NextResponse.json(
      { message: "Application submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Apply error:", error);
    return NextResponse.json(
      { message: "Failed to apply" },
      { status: 500 }
    );
  }
}
