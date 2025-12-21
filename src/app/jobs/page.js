"use client";

import { useEffect, useState } from "react";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        {jobs.map((job) => (
          <div
            key={job._id}
            className="border border-zinc-700 bg-zinc-900 rounded-lg p-5"
          >
            <h2 className="text-xl font-semibold">
              {job.company}
            </h2>

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
              {job.minCgpa ?? "Not specified"}
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
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
              >
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
