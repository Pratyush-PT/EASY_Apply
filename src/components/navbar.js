"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in by checking if we're on a protected route
  // or by making an API call
  useEffect(() => {
    const checkAuth = async () => {
      // If we're on a student page (protected by middleware), user is logged in
      const studentPages = ["/jobs", "/applications", "/profile"];
      if (studentPages.some((page) => pathname.startsWith(page))) {
        setIsLoggedIn(true);
        return;
      }

      // Otherwise, check via API
      try {
        const res = await fetch("/api/me");
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, [pathname]);

  // ✅ Hide navbar on admin routes (do NOT block rendering)
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsLoggedIn(false);
      router.push("/login");
    } catch (error) {
      // Fallback: just redirect
      setIsLoggedIn(false);
      router.push("/login");
    }
  };

  const isActive = (path) => pathname === path;

  return (
    <nav className="w-full bg-zinc-900 px-8 py-4 flex justify-between items-center shadow-lg border-b border-zinc-800">
      {/* Logo - Clickable */}
      <Link href={isLoggedIn ? "/jobs" : "/"} className="text-xl font-bold tracking-wide text-white hover:text-green-400 transition">
        EasyApply
      </Link>

      {/* Navigation Links */}
      <div className="flex gap-6 text-sm font-medium text-zinc-300 items-center">
        {isLoggedIn ? (
          <>
            <Link
              href="/jobs"
              className={`hover:text-white transition ${
                isActive("/jobs") ? "text-white font-semibold" : ""
              }`}
            >
              Jobs
            </Link>
            <Link
              href="/applications"
              className={`hover:text-green-400 transition ${
                isActive("/applications")
                  ? "text-green-400 font-semibold"
                  : ""
              }`}
            >
              My Applications
            </Link>
            <Link
              href="/profile"
              className={`hover:text-white transition ${
                isActive("/profile") ? "text-white font-semibold" : ""
              }`}
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/"
              className={`hover:text-white transition ${
                isActive("/") ? "text-white font-semibold" : ""
              }`}
            >
              Home
            </Link>
            <Link
              href="/signup"
              className={`hover:text-white transition ${
                isActive("/signup") ? "text-white font-semibold" : ""
              }`}
            >
              Signup
            </Link>
            <Link
              href="/login"
              className={`hover:text-white transition ${
                isActive("/login") ? "text-white font-semibold" : ""
              }`}
            >
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
