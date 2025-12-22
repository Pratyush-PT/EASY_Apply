"use client";
import { useState } from "react";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    cgpa: "",
    branch: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    console.log(data);

    if (data.success) {
      alert("Signup successful!");
      window.location.href = "/login";
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
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="p-3 bg-zinc-800 border border-zinc-700 rounded"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="p-3 bg-zinc-800 border border-zinc-700 rounded"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />

          {/* ✅ CGPA */}
          <input
            type="number"
            step="0.01"
            placeholder="CGPA"
            className="p-3 bg-zinc-800 border border-zinc-700 rounded"
            onChange={(e) =>
              setForm({ ...form, cgpa: e.target.value })
            }
            required
          />

          {/* ✅ Branch */}
          <select
            className="p-3 bg-zinc-800 border border-zinc-700 rounded"
            onChange={(e) =>
              setForm({ ...form, branch: e.target.value })
            }
            required
          >
            <option value="">Select Branch</option>
            <option value="CSE">CSE</option>
            
            <option value="ECE">ECE</option>
            <option value="EIE">IT</option>
            <option value="EE">ME</option>
            <option value="ME">ME</option>
            <option value="CE">IT</option>
          </select>

          <button className="bg-blue-600 hover:bg-blue-700 transition text-white p-3 rounded font-semibold">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
