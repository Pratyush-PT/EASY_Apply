"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

export default function Signup() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password confirmation
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._]+_ug_\d{2}@(cse|ece|eie|ee|me|ce)\.nits\.ac\.in$/;
    if (!emailRegex.test(form.email)) {
      alert("Please use your institute email ID (e.g., name_ug_23@cse.nits.ac.in)");
      return;
    }

    // Validate password length
    if (form.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ auto-login already done in backend
      router.replace("/profile");
    } else {
      const errorMessage = data.error || data.message || "Signup failed";
      alert(errorMessage);
      console.error("Signup error:", data);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="glass p-6 md:p-8 rounded-2xl shadow-2xl w-[90%] md:w-full max-w-md relative z-10 border border-white/10">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1">Full Name</label>
            <input
              type="text"
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1">Institute Email</label>
            <input
              type="email"
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1">Password</label>
            <PasswordInput
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1">Confirm Password</label>
            <PasswordInput
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            Sign Up
          </button>

          <div className="text-center mt-6 text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:text-purple-400 underline decoration-purple-500/30 underline-offset-4 transition-colors">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
