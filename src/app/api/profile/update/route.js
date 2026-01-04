import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function PUT(req) {
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

    const body = await req.json();
    const { name, email, branch, cgpa, contact, password } = body;

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 }
        );
      }
      user.email = email;
    }
    if (branch !== undefined) user.branch = branch;
    if (cgpa !== undefined) {
      // Fix precision: round to 2 decimal places
      user.cgpa = Math.round(parseFloat(cgpa) * 100) / 100;
    }
    if (contact !== undefined) user.contact = contact;
    if (password !== undefined && password.trim() !== "") {
      // Hash new password
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        cgpa: user.cgpa,
        contact: user.contact,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

