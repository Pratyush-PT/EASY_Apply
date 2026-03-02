"use client";

import { useEffect, useState } from "react";
import { Download, FileText, ExternalLink, GraduationCap, User, Mail, Phone, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

function InfoChip({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
      <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
      <span className="text-slate-400">{label}:</span>
      <span className="text-slate-700">{value}</span>
    </div>
  );
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/applications", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => { setApplications(data.applications || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Group applications by jobId
  const grouped = applications.reduce((acc, app) => {
    const key = app.jobId?._id || "unknown";
    if (!acc[key]) acc[key] = { job: app.jobId, apps: [] };
    acc[key].apps.push(app);
    return acc;
  }, {});

  const groups = Object.values(grouped);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Applications</h1>
          <p className="text-sm text-slate-500 mt-1">{applications.length} application{applications.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => window.open("/api/admin/applications/export", "_blank")}
          className="flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto rounded-xl bg-white border border-slate-200 shadow-sm text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Download className="w-4 h-4" />
          Export All
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
          <FileText className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-500">No applications yet.</p>
        </div>
      ) : (
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="space-y-4"
        >
          {groups.map(({ job, apps }) => (
            <motion.div
              key={job?._id || "unknown"}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeInOut" } }
              }}
              className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-slate-50/50">
                <div>
                  <h2 className="font-semibold text-slate-900 text-base">{job?.company || "Unknown Company"}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{job?.role || "Unknown Role"}</p>
                </div>
                <div className="flex items-center justify-start w-full sm:w-auto mt-2 sm:mt-0 gap-4">
                  <span className="text-sm font-medium text-slate-500">{apps.length} applicant{apps.length !== 1 ? 's' : ''}</span>
                  <button
                    onClick={() => window.open(`/api/admin/applications/export?jobId=${job?._id}`, "_blank")}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-indigo-600 text-slate-600 text-xs font-semibold transition-all ml-auto sm:ml-0"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Applicants */}
              <div className="divide-y divide-slate-100">
                {apps.map((app) => (
                  <div key={app._id} className="px-4 sm:px-6 py-4 sm:py-5 hover:bg-slate-50 transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-4">
                      <div>
                        <p className="font-semibold text-slate-900 text-base tracking-tight">
                          {app.studentId?.name || app.name || "Unnamed"}
                        </p>
                        <p className="text-xs font-medium text-slate-400 mt-1">
                          {new Date(app.createdAt).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2.5 mb-4">
                      <InfoChip icon={Mail} label="Email" value={app.studentId?.email || app.email} />
                      <InfoChip icon={Phone} label="Phone" value={app.studentId?.contact} />
                      <InfoChip icon={GraduationCap} label="CGPA" value={app.studentId?.cgpa || app.cgpa} />
                      <InfoChip icon={BookOpen} label="Branch" value={app.studentId?.branch || app.branch} />
                    </div>

                    {/* Resumes */}
                    {app.studentId?.resumes?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {app.studentId.resumes.map((resume, idx) => (
                          <a
                            key={idx}
                            href={resume.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 hover:border-indigo-100 transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {resume.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
