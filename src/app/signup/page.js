"use client";
import { useState } from "react";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // important fix
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
            className="p-3 bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:border-blue-500"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email"
            className="p-3 bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:border-blue-500"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            className="p-3 bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:border-blue-500"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button className="bg-blue-600 hover:bg-blue-700 transition text-white p-3 rounded font-semibold">
            Sign Up
          </button>

        </form>

      </div>
    </div>
  );
}
