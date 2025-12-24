import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    let body;

    // Safe JSON parsing
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { name, email, password, cgpa, branch } = body;

    // Validate required fields
    if (!name || !email || !password || cgpa === undefined || !branch) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      cgpa,
      branch,
      role: "student", // 👈 important for auth
    });

    // ✅ AUTO LOGIN — CREATE JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ SET COOKIE
    const res = NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          cgpa: user.cgpa,
          branch: user.branch,
          role: user.role,
        },
      },
      { status: 201 }
    );

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });

    return res;
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
