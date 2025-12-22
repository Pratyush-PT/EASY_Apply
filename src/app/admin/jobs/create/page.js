"use client";
import { useState } from "react";

export default function CreateJob() {
  const [form, setForm] = useState({
    company: "",
    role: "",
    description: "",
    eligibleBranches: "",
    minCgpa: "",
    deadline: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      eligibleBranches: form.eligibleBranches
        .split(",")
        .map(b => b.trim()),
      minCgpa: form.minCgpa ? Number(form.minCgpa) : undefined,
    };

    const res = await fetch("/api/admin/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Job created");
      window.location.href = "/admin/jobs";
    } else {
      alert(data.message || "Failed");
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4">Create Job</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">

        <input placeholder="Company"
          onChange={e => setForm({ ...form, company: e.target.value })}
          className="p-2 text-black" />

        <input placeholder="Role"
          onChange={e => setForm({ ...form, role: e.target.value })}
          className="p-2 text-black" />

        <textarea placeholder="Description"
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="p-2 text-black" />

        <input placeholder="Eligible Branches (CSE,IT)"
          onChange={e => setForm({ ...form, eligibleBranches: e.target.value })}
          className="p-2 text-black" />

        <input placeholder="Min CGPA"
          onChange={e => setForm({ ...form, minCgpa: e.target.value })}
          className="p-2 text-black" />

        <input type="date"
          onChange={e => setForm({ ...form, deadline: e.target.value })}
          className="p-2 text-black" />

        <button className="bg-blue-600 p-2">Create</button>
      </form>
    </div>
  );
}
