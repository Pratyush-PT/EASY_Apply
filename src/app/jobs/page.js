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
      } catch (err) {
        setError("Unable to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // 🔹 Fetch already applied jobs (PERSISTENCE)
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const res = await fetch("/api/applications/me");
        if (!res.ok) return;

        const data = await res.json();

        setAppliedJobs(() => {
          const set = new Set();
          data.forEach((app) => set.add(app.jobId));
          return set;
        });
      } catch (err) {
        console.error("Failed to fetch applied jobs");
      }
    };

    fetchAppliedJobs();
  }, []);

  // 🔹 Handle Apply
  const handleApply = async (jobId) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      // ✅ Applied OR already applied → update UI
      if (res.status === 201 || res.status === 409) {
        setAppliedJobs((prev) => {
          const next = new Set(prev);
          next.add(jobId);
          return next;
        });
        return;
      }

      alert(data.message || "Failed to apply");
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
                Deadline: {new Date(job.deadline).toLocaleDateString()}
              </p>

              <p className="mt-3">
                <strong>Eligible Branches:</strong>{" "}
                {job.eligibleBranches.join(", ")}
              </p>

              <p className="mt-1">
                <strong>Minimum CGPA:</strong>{" "}
                {job.minCgpa ?? 9}
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
                  disabled={isApplied}
                  onClick={() => handleApply(job._id)}
                  className={`px-4 py-2 rounded text-white ${
                    isApplied
                      ? "bg-gray-600 cursor-not-allowed"
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
