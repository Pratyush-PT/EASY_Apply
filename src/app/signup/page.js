"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    cgpa: "",
    branch: "",
    contact: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form), // ✅ FIXED (was formData)
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ auto-login already done in backend
      router.replace("/profile");
    } else {
      alert(data.error || "Signup failed");
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

          <input
            type="password"
            placeholder="Password"
            className="p-3 bg-zinc-800 border border-zinc-700 rounded"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />

          <input
            type="number"
            step="0.01"
            placeholder="CGPA"
            className="p-3 bg-zinc-800 border border-zinc-700 rounded"
            value={form.cgpa}
            onChange={(e) =>
              setForm({ ...form, cgpa: e.target.value })
            }
            required
          />

          <select
            className="p-3 bg-zinc-800 border border-zinc-700 rounded"
            value={form.branch}
            onChange={(e) =>
              setForm({ ...form, branch: e.target.value })
            }
            required
          >
            <option value="">Select Branch</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EIE">EIE</option>
            <option value="EE">EE</option>
            <option value="ME">ME</option>
            <option value="CE">CE</option>
          </select>

          <input
            type="tel"
            placeholder="Phone Number (optional)"
            className="p-3 bg-zinc-800 border border-zinc-700 rounded"
            value={form.contact}
            onChange={(e) =>
              setForm({ ...form, contact: e.target.value })
            }
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
