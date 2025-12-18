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
