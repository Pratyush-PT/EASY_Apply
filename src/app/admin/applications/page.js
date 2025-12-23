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

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setApplications(prev =>
        prev.map(app =>
          app._id === id ? { ...app, status } : app
        )
      );
    }
  };

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
              <p className="font-semibold text-lg">
                {app.name || "Unnamed Applicant"}
              </p>

              <p className="text-sm text-zinc-400">
                {app.email || "No email provided"}
              </p>

              <p className="text-sm mt-2">
                Applied for:{" "}
                <span className="font-medium">
                  {app.jobId?.role}
                </span>{" "}
                @ {app.jobId?.company}
              </p>

              <p className="mt-2">
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

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => updateStatus(app._id, "Shortlisted")}
                  className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-sm"
                >
                  Shortlist
                </button>

                <button
                  onClick={() => updateStatus(app._id, "Rejected")}
                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

