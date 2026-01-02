"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md bg-zinc-900 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            className="p-3 bg-zinc-800 border border-zinc-700 rounded"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="p-3 bg-zinc-800 border border-zinc-700 rounded"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />

          <PasswordInput
            placeholder="Password"
            className="p-3 bg-zinc-800 border border-zinc-700 rounded"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
            minLength={6}
          />

          <PasswordInput
            placeholder="Confirm Password"
            className="p-3 bg-zinc-800 border border-zinc-700 rounded"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            required
            minLength={6}
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition text-white p-3 rounded font-semibold"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
