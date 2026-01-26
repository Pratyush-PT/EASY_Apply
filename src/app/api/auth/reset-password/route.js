import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        await connectDB();
        const { email, otp, newPassword } = await req.json();

        // Validate required fields
        if (!email || !otp || !newPassword) {
            return NextResponse.json(
                { error: "Email, OTP, and new password are required" },
                { status: 400 }
            );
        }

        // 1. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // 2. Verify OTP (Strict check)
        if (!user.otp || user.otp !== otp) {
            return NextResponse.json(
                { error: "Invalid or undefined OTP" },
                { status: 400 }
            );
        }

        // 3. Verify OTP Expiry
        if (user.otpExpiry < Date.now()) {
            return NextResponse.json(
                { error: "OTP has expired" },
                { status: 400 }
            );
        }

        // 4. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 5. Update user
        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        return NextResponse.json({
            success: true,
            message: "Password reset successfully",
        });

    } catch (err) {
        console.error("Reset Password Error:", err);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
