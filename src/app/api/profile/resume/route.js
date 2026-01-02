import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req) {
  try {
    // Auth check
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get form data
    const formData = await req.formData();
    const file = formData.get("resume");
    const resumeName = formData.get("name") || "Resume";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type (PDF only)
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "resumes");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${user._id}_${timestamp}_${file.name}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Create resume URL
    const resumeUrl = `/uploads/resumes/${filename}`;

    // Add resume to user's resumes array
    user.resumes.push({
      name: resumeName,
      url: resumeUrl,
    });

    await user.save();

    return NextResponse.json({
      success: true,
      resume: {
        name: resumeName,
        url: resumeUrl,
      },
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload resume" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch user's resumes
export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    const user = await User.findById(decoded.id).select("resumes");
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ resumes: user.resumes || [] });
  } catch (error) {
    console.error("Get resumes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to delete a resume
export async function DELETE(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const resumeUrl = searchParams.get("url");

    if (!resumeUrl) {
      return NextResponse.json(
        { error: "Resume URL is required" },
        { status: 400 }
      );
    }

    // Find and remove resume from array
    const resumeIndex = user.resumes.findIndex(
      (r) => r.url === resumeUrl
    );

    if (resumeIndex === -1) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    // Remove resume from array
    user.resumes.splice(resumeIndex, 1);
    await user.save();

    // Delete file from filesystem
    try {
      const filename = resumeUrl.split("/").pop();
      const filepath = join(process.cwd(), "public", resumeUrl);
      if (existsSync(filepath)) {
        await unlink(filepath);
      }
    } catch (fileError) {
      console.error("Error deleting file:", fileError);
      // Continue even if file deletion fails
    }

    return NextResponse.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Delete resume error:", error);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    );
  }
}

