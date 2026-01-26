
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req) {
    try {
        await connectDB();
        const { email } = await req.json();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { error: "User with this email does not exist" },
                { status: 404 }
            );
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send OTP via email
        await sendEmail({
            to: email,
            subject: "Reset Password OTP",
            text: `Your OTP for password reset is: ${otp}. It is valid for 15 minutes.`,
        });

        return NextResponse.json({
            success: true,
            message: "OTP sent to your email",
        });

    } catch (err) {
        console.error("Forgot Password Error:", err);
        return NextResponse.json(
            { error: err.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
