"use client";

import { useEffect, useState } from "react";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Fetch my applications
        const appsRes = await fetch("/api/applications/me");
        if (!appsRes.ok) throw new Error("Failed to fetch applications");
        const appsData = await appsRes.json();

        // 2️⃣ Fetch all jobs
        const jobsRes = await fetch("/api/jobs");
        if (!jobsRes.ok) throw new Error("Failed to fetch jobs");
        const jobsData = await jobsRes.json();

        setApplications(appsData);
        setJobs(jobsData);
      } catch (err) {
        setError("Unable to load applications");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="p-6 text-gray-400">Loading applications...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  if (applications.length === 0) {
    return (
      <p className="p-6 text-gray-400">
        You haven't applied to any jobs yet.
      </p>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>

      <div className="space-y-4">
        {applications.map((app) => {
          const job = jobs.find((j) => j._id === app.jobId);

          if (!job) return null;

          return (
            <div
              key={app._id}
              className="border border-zinc-700 bg-zinc-900 rounded-lg p-5"
            >
              <h2 className="text-xl font-semibold">{job.company}</h2>
              <p className="text-gray-300">{job.role}</p>

              <p className="text-sm text-gray-400 mt-1">
                Applied on{" "}
                {new Date(app.createdAt || Date.now()).toLocaleDateString()}
              </p>

              <span className="inline-block mt-3 px-3 py-1 text-sm rounded bg-green-700 text-white">
                Applied
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


