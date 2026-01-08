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


  // LOADING
  if (loading) {
    return (
      <div className="p-6 text-white">
        Loading applications...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 text-white">
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
              {/* APPLICANT INFO */}
              <div className="mb-3">
                <p className="font-semibold text-lg">
                  {app.studentId?.name || app.name || "Unnamed Applicant"}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <span className="text-zinc-400">Email:</span>{" "}
                    <span className="text-white">
                      {app.studentId?.email || app.email || "N/A"}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400">Phone:</span>{" "}
                    <span className="text-white">
                      {app.studentId?.contact || "N/A"}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400">CGPA:</span>{" "}
                    <span className="text-white">
                      {app.studentId?.cgpa || app.cgpa || "N/A"}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400">Branch:</span>{" "}
                    <span className="text-white">
                      {app.studentId?.branch || app.branch || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* JOB */}
              <div className="mt-3 pt-3 border-t border-zinc-700">
                <p className="text-sm">
                  <span className="text-zinc-400">Role Applied For:</span>{" "}
                  <span className="font-medium text-white">
                    {app.jobId?.role}
                  </span>{" "}
                  @ <span className="font-medium text-white">{app.jobId?.company}</span>
                </p>
              </div>

              {/* RESUME */}
              {app.studentId?.resumes && app.studentId.resumes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-700">
                  <p className="text-sm text-zinc-400 mb-2">Resume(s):</p>
                  <div className="flex flex-wrap gap-2">
                    {app.studentId.resumes.map((resume, idx) => (
                      <a
                        key={idx}
                        href={resume.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        View {resume.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-3 mt-4">
                {/* PER‑JOB CSV EXPORT */}
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
