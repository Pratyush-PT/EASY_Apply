import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req) {
    try {
        await connectDB();

        const { email, otp } = await req.json();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 400 });
        }

        // Check if OTP matches and is not expired
        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
        }

        // Clear OTP and set verified
        user.otp = undefined;
        user.otpExpiry = undefined;
        user.isVerified = true;
        await user.save();

        // Generate Token (Logic moved from login)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const res = NextResponse.json({
            success: true,
            role: user.role,
            message: "Login successful"
        });

        res.cookies.set("token", token, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: false, // localhost
            maxAge: 60 * 60 * 24 * 7,
        });

        return res;

    } catch (err) {
        console.error("Verify OTP error:", err);
        return NextResponse.json(
            { error: "Verification failed" },
            { status: 500 }
        );
    }
}
