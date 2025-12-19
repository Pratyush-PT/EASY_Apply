"use client";
import { useState } from "react";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    console.log(data);

    if (data.token) {
      localStorage.setItem("token", data.token);
    }
  };
"use client";
import { useState } from "react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    console.log(data);

    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("Login successful!");
      window.location.href = "/profile";
    } else {
      alert(data.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md bg-zinc-900 p-6 rounded-lg shadow-lg">
        
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input
            type="email"
            placeholder="Email"
            className="p-3 bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:border-green-500"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            className="p-3 bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:border-green-500"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button className="bg-green-600 hover:bg-green-700 transition text-white p-3 rounded font-semibold">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
      <input
        placeholder="Email"
        className="border p-2"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder="Password"
        type="password"
        className="border p-2"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button className="bg-green-600 text-white p-2">Log In</button>
    </form>
  );
}
