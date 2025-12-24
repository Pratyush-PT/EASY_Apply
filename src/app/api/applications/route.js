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
