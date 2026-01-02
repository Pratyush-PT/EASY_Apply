"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      router.push("/login");
    }
  };

  const isActive = (path) => pathname === path || pathname.startsWith(path + "/");

  return (
    <nav className="w-full bg-zinc-900 px-8 py-4 flex justify-between items-center shadow-lg border-b border-zinc-800">
      {/* Logo */}
      <Link href="/admin" className="text-xl font-bold tracking-wide text-white hover:text-blue-400 transition">
        EasyApply Admin
      </Link>

      {/* Navigation Links */}
      <div className="flex gap-6 text-sm font-medium text-zinc-300 items-center">
        <Link
          href="/admin"
          className={`hover:text-white transition ${
            isActive("/admin") && pathname === "/admin" ? "text-white font-semibold" : ""
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/admin/jobs"
          className={`hover:text-white transition ${
            isActive("/admin/jobs") ? "text-white font-semibold" : ""
          }`}
        >
          Jobs
        </Link>
        <Link
          href="/admin/applications"
          className={`hover:text-white transition ${
            isActive("/admin/applications") ? "text-white font-semibold" : ""
          }`}
        >
          Applications
        </Link>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

