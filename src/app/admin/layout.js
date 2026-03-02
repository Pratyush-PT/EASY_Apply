'use client'

import AdminSidebar from "@/components/AdminSidebar";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch { }
    router.push('/login');
  };

  return (
    <div className="flex flex-col md:flex-row bg-slate-50 text-slate-900 font-sans min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Desktop Top-Right Logout */}
        <div className="hidden md:flex justify-end pt-5 px-6 lg:px-8 max-w-7xl mx-auto w-full z-10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
