import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  /* =====================================================
     1️⃣ AUTH PAGES — redirect logged-in users away
  ====================================================== */
  if (token && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }

  /* =====================================================
     2️⃣ PROTECTED PAGES — require login
  ====================================================== */
  const protectedRoutes = ["/profile", "/my-applications", "/admin"];

  const isProtectedPage = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  /* =====================================================
     3️⃣ ADMIN API PROTECTION (your original logic)
  ====================================================== */
  if (pathname.startsWith("/api/admin")) {
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== "admin") {
        return NextResponse.json(
          { message: "Forbidden" },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/profile",
    "/my-applications",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
