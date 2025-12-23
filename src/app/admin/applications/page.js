"use client";

import { useEffect, useState } from "react";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/applications")
      .then(res => res.json())
      .then(data => {
        setApplications(data.applications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6 text-white">Loading applications...</div>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Job Applications</h1>

      {applications.length === 0 ? (
        <p className="text-zinc-400">No applications found.</p>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div
              key={app._id}
              className="border border-zinc-700 rounded-lg p-4 bg-zinc-900"
            >
              {/* Student snapshot info */}
              <p className="font-semibold text-lg">
                {app.name || "Unnamed Applicant"}
              </p>

              <p className="text-sm text-zinc-400">
                {app.email || "No email provided"}
              </p>

              {/* Job info (populated from jobId) */}
              <p className="text-sm text-zinc-300 mt-2">
                Applied for:{" "}
                <span className="font-medium">
                  {app.jobId?.role || "Unknown Role"}
                </span>{" "}
                @{" "}
                <span className="font-medium">
                  {app.jobId?.company || "Unknown Company"}
                </span>
              </p>

              {/* Status */}
              <p className="text-sm mt-2">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    app.status === "Applied"
                      ? "text-yellow-400"
                      : app.status === "Shortlisted"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {app.status}
                </span>
              </p>

              {/* Date */}
              <p className="text-xs text-zinc-500 mt-1">
                Applied on:{" "}
                {new Date(app.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
