import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req) {
  let user;
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

    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format (NIT Silchar Student ID only)
    const emailRegex = /^[a-zA-Z0-9._]+_ug_\d{2}@(cse|ece|eie|ee|me|ce)\.nits\.ac\.in$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Email! Please use your institute email ID (e.g., name_ug_23@cse.nits.ac.in)."
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long" },
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

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Define user in outer scope (implied by removal of const here, logic added above)
    // Actually simpler: just remove const and declare let above.
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student", // 👈 important for auth
      // cgpa, branch, and contact will be set in profile section
    });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    await sendEmail({
      to: email,
      subject: "Your Signup OTP",
      text: `Welcome to Easy Apply! Your OTP for signup is: ${otp}. It is valid for 10 minutes.`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Signup successful. OTP sent to your email.",
        step: "otp",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Cleanup: Delete user if email fails (so they can try again)
    if (user && user._id) {
      try {
        console.log(`[Signup Error] Attempting to delete user ${user._id} due to failure...`);
        await User.findByIdAndDelete(user._id);
        console.log(`[Signup Error] User ${user._id} deleted successfully.`);
      } catch (cleanupError) {
        console.error(`[Signup Error] Failed to delete user ${user._id}:`, cleanupError);
      }
    }

    console.error("Signup error:", error);
    console.error("Error details:", error.message);

    // Check for specific "Email could not be sent" or credential errors
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
