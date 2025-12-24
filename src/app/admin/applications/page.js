"use client";

import { useEffect, useState } from "react";

export default function AdminApplicationsPage() {
  // STATE
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH APPLICATIONS
  useEffect(() => {
    fetch("/api/admin/applications", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setApplications(data.applications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // UPDATE STATUS
  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setApplications((prev) =>
        prev.map((app) =>
          app._id === id ? { ...app, status } : app
        )
      );
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="p-6 text-white">
        Loading applications...
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Job Applications
        </h1>

        {/* GLOBAL EXPORT */}
        <button
          onClick={() =>
            window.open(
              "/api/admin/applications/export",
              "_blank"
            )
          }
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Export All (CSV)
        </button>
      </div>

      {/* BODY */}
      {applications.length === 0 ? (
        <p className="text-zinc-400">
          No applications found.
        </p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="border border-zinc-700 rounded-lg p-4 bg-zinc-900"
            >
              {/* APPLICANT */}
              <p className="font-semibold text-lg">
                {app.studentId?.name || "Unnamed Applicant"}
              </p>

              <p className="text-sm text-zinc-400">
                {app.studentId?.email || "No email provided"}
              </p>

              {/* JOB */}
              <p className="text-sm mt-2">
                Applied for{" "}
                <span className="font-medium">
                  {app.jobId?.role}
                </span>{" "}
                @ {app.jobId?.company}
              </p>

              {/* STATUS */}
              <p className="mt-2">
                Status{" "}
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

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() =>
                    updateStatus(app._id, "Shortlisted")
                  }
                  className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-sm"
                >
                  Shortlist
                </button>

                <button
                  onClick={() =>
                    updateStatus(app._id, "Rejected")
                  }
                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-sm"
                >
                  Reject
                </button>

                {/* 🔥 PER‑JOB CSV EXPORT */}
                <button
                  onClick={() =>
                    window.open(
                      `/api/admin/applications/export?jobId=${app.jobId?._id}`,
                      "_blank"
                    )
                  }
                  className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-sm"
                >
                  Export This Job
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
