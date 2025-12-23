"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // ✅ Hide navbar on admin routes (do NOT block rendering)
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="w-full bg-zinc-900 px-8 py-4 flex justify-between items-center shadow-lg border-b border-zinc-800">
      {/* Logo */}
      <h1 className="text-xl font-bold tracking-wide text-white">
        EasyApply
      </h1>

      {/* Navigation Links */}
      <div className="flex gap-6 text-sm font-medium text-zinc-300">
        <Link href="/" className="hover:text-white transition">Home</Link>
        <Link href="/signup" className="hover:text-white transition">Signup</Link>
        <Link href="/login" className="hover:text-white transition">Login</Link>
        <Link href="/profile" className="hover:text-white transition">Profile</Link>
        <Link href="/applications" className="hover:text-green-400 transition">
          My Applications
        </Link>
      </div>
    </nav>
  );
}
