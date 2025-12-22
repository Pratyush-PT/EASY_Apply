import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // 🔐 Protect admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ❌ Not admin
      if (decoded.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }

      // ✅ Admin allowed
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

// 🔥 VERY IMPORTANT
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
