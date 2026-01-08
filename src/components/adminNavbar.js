"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useState, useEffect } from "react";

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      router.push("/login");
    }
  };

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (path) => pathname === path || pathname.startsWith(path + "/");

  return (
    <nav className="w-full bg-zinc-900 shadow-lg border-b border-zinc-800 relative z-50">
      <div className="px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/admin" className="text-xl font-bold tracking-wide text-white hover:text-blue-400 transition">
          EasyApply Admin
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex gap-6 text-sm font-medium text-zinc-300 items-center">
          <Link
            href="/admin"
            className={`hover:text-white transition ${isActive("/admin") && pathname === "/admin" ? "text-white font-semibold" : ""
              }`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/jobs"
            className={`hover:text-white transition ${isActive("/admin/jobs") ? "text-white font-semibold" : ""
              }`}
          >
            Jobs
          </Link>
          <Link
            href="/admin/applications"
            className={`hover:text-white transition ${isActive("/admin/applications") ? "text-white font-semibold" : ""
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
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-800 absolute w-full left-0 shadow-xl">
          <div className="flex flex-col p-4 space-y-4 text-center">
            <Link
              href="/admin"
              className={`block py-2 hover:text-white transition ${isActive("/admin") && pathname === "/admin" ? "text-white font-semibold" : "text-zinc-400"
                }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/jobs"
              className={`block py-2 hover:text-white transition ${isActive("/admin/jobs") ? "text-white font-semibold" : "text-zinc-400"
                }`}
            >
              Jobs
            </Link>
            <Link
              href="/admin/applications"
              className={`block py-2 hover:text-white transition ${isActive("/admin/applications") ? "text-white font-semibold" : "text-zinc-400"
                }`}
            >
              Applications
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white w-full py-3 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}


