"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchJobs() {
      const res = await fetch("/api/admin/jobs");
      const data = await res.json();
      setJobs(data.jobs || []);
      setLoading(false);
    }
    fetchJobs();
  }, []);

  if (loading) return <p className="p-6">Loading jobs...</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Admin – Jobs</h1>

      <button
        onClick={() => router.push("/admin/jobs/create")}
        className="mb-4 px-4 py-2 bg-green-600 rounded"
      >
        + Create Job
      </button>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="border border-gray-700 p-4 rounded"
          >
            <h2 className="text-xl font-semibold">
              {job.company} – {job.role}
            </h2>
            <p className="text-sm text-zinc-400">Min CGPA: {job.minCgpa ?? "N/A"}</p>
            
            <div className="mt-2 flex gap-4 text-sm">
              <p>
                <span className="text-zinc-400">Applied:</span>{" "}
                <span className="text-green-400 font-semibold">{job.appliedCount || 0}</span>
              </p>
              <p>
                <span className="text-zinc-400">Interested (Not Applied):</span>{" "}
                <span className="text-orange-400 font-semibold">{job.interestedNotApplied || 0}</span>
              </p>
            </div>

            <div className="mt-3 flex gap-3">
              <button
                onClick={() =>
                  router.push(`/admin/jobs/${job._id}/edit`)
                }
                className="px-3 py-1 bg-blue-600 rounded"
              >
                Edit
              </button>

              <button
                onClick={async () => {
                  if (!confirm("Delete this job?")) return;
                  await fetch(`/api/admin/jobs/${job._id}`, {
                    method: "DELETE",
                  });
                  setJobs(jobs.filter((j) => j._id !== job._id));
                }}
                className="px-3 py-1 bg-red-600 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
