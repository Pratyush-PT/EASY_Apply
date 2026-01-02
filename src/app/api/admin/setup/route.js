import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if admin already exists
    let admin = await User.findOne({ email, role: "admin" });

    if (admin) {
      // Update existing admin password
      const hashedPassword = await bcrypt.hash(password, 10);
      admin.password = hashedPassword;
      await admin.save();

      return NextResponse.json({
        success: true,
        message: "Admin account updated successfully",
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
        },
      });
    } else {
      // Create new admin account
      const hashedPassword = await bcrypt.hash(password, 10);

      admin = await User.create({
        name: "Admin",
        email,
        password: hashedPassword,
        role: "admin",
        cgpa: 0, // Default value for admin
        branch: "N/A", // Default value for admin
      });

      return NextResponse.json({
        success: true,
        message: "Admin account created successfully",
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
        },
      });
    }
  } catch (error) {
    console.error("Admin setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup admin account" },
      { status: 500 }
    );
  }
}

