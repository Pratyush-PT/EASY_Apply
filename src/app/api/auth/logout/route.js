import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    
    // Clear the token cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: false,
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}

