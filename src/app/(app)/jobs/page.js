"use client";

import { useEffect, useState } from "react";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  // 🔹 Fetch all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs");
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        setJobs(data);
      } catch {
        setError("Unable to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // 🔹 Fetch already applied jobs (persistence)
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const res = await fetch("/api/applications/me", {
          credentials: "include",
        });
        if (!res.ok) return;

        const data = await res.json();

        setAppliedJobs(() => {
          const set = new Set();
          data.forEach((app) => set.add(app.jobId));
          return set;
        });
      } catch {
        console.error("Failed to fetch applied jobs");
      }
    };

    fetchAppliedJobs();
  }, []);

  // 🔹 APPLY HANDLER
  const handleApply = async (jobId) => {
    // If already applied, show message and return
    if (appliedJobs.has(jobId)) {
      alert("Already applied");
      return;
    }

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      const data = await res.json();

      // ✅ Success
      if (res.ok) {
        setAppliedJobs((prev) => {
          const next = new Set(prev);
          next.add(jobId);
          return next;
        });
        alert("Application submitted successfully!");
      } else if (res.status === 409 && data.alreadyApplied) {
        // Already applied (edge case)
        setAppliedJobs((prev) => {
          const next = new Set(prev);
          next.add(jobId);
          return next;
        });
        alert("Already applied");
      } else {
        alert(data.error || "Failed to apply");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong while applying");
    }
  };

  if (loading) {
    return <p className="p-6 text-gray-400">Loading jobs...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Available Jobs</h1>

      {jobs.length === 0 && (
        <p className="text-gray-400">No jobs posted yet.</p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {jobs.map((job) => {
          const isApplied = appliedJobs.has(job._id);

          return (
            <div
              key={job._id}
              className="border border-zinc-700 bg-zinc-900 rounded-lg p-5"
            >
              <h2 className="text-xl font-semibold">{job.company}</h2>
              <p className="text-lg text-gray-300">{job.role}</p>

              <p className="text-sm text-gray-400 mt-1">
                Deadline:{" "}
                {new Date(job.deadline).toLocaleDateString()}
              </p>

              <p className="mt-3">
                <strong>Eligible Branches:</strong>{" "}
                {job.eligibleBranches.join(", ")}
              </p>

              <p className="mt-1">
                <strong>Minimum CGPA:</strong>{" "}
                {job.minCgpa ?? "N/A"}
              </p>

              {job.jdPdfUrl && (
                <a
                  href={job.jdPdfUrl}
                  target="_blank"
                  className="inline-block mt-3 text-blue-400 underline"
                >
                  View Job Description
                </a>
              )}

              <div className="mt-5">
                <button
                  onClick={() => handleApply(job._id)}
                  disabled={isApplied}
                  className={`px-4 py-2 rounded text-white ${
                    isApplied
                      ? "bg-gray-600 cursor-not-allowed opacity-60"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isApplied ? "Applied" : "Apply"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

