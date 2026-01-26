"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Calendar, CheckCircle, ExternalLink, Heart, GraduationCap, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [interestedJobs, setInterestedJobs] = useState(new Set());

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

    const fetchData = async () => {
      try {
        const [appsRes, interestsRes] = await Promise.all([
          fetch("/api/applications/me", { credentials: "include" }),
          fetch("/api/interests", { credentials: "include" })
        ]);

        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setAppliedJobs(new Set(appsData.map(app => app.jobId)));
        }

        if (interestsRes.ok) {
          const interestsData = await interestsRes.json();
          setInterestedJobs(new Set(interestsData.interests?.map(i => i.jobId)));
        }

        // Check for deadline notifications
        const notificationsRes = await fetch("/api/notifications/check", { credentials: "include" });
        if (notificationsRes.ok) {
          const notificationsData = await notificationsRes.json();
          if (notificationsData.notifications?.length > 0) {
            notificationsData.notifications.forEach((notif) => {
              const deadlineDate = new Date(notif.deadline).toLocaleDateString("en-GB");
              alert(
                `⏰ Reminder: ${notif.company} - ${notif.role} deadline is approaching!\nDeadline: ${deadlineDate}\n\nDon't forget to apply!`
              );
            });
          }
        }

      } catch (e) {
        console.error("Failed to fetch user data", e);
      }
    };

    fetchJobs();
    fetchData();
  }, []);

  const handleApply = async (jobId) => {
    if (appliedJobs.has(jobId)) return alert("Already applied");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();

      if (res.ok || (res.status === 409 && data.alreadyApplied)) {
        setAppliedJobs((prev) => new Set(prev).add(jobId));
        alert(res.ok ? "Application submitted successfully!" : "Already applied");
      } else {
        alert(data.error || "Failed to apply");
      }
    } catch {
      alert("Something went wrong while applying");
    }
  };

  const handleInterest = async (jobId) => {
    const isInterested = interestedJobs.has(jobId);
    try {
      const method = isInterested ? "DELETE" : "POST";
      const url = isInterested ? `/api/interests?jobId=${jobId}` : "/api/interests";
      const body = isInterested ? undefined : JSON.stringify({ jobId });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body
      });

      if (res.ok) {
        setInterestedJobs((prev) => {
          const newSet = new Set(prev);
          if (isInterested) newSet.delete(jobId);
          else newSet.add(jobId);
          return newSet;
        });
        if (!isInterested) alert("Marked as interested! You'll be notified before the deadline.");
      } else {
        alert("Failed to update interest");
      }
    } catch {
      alert("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-400 gap-4">
        <AlertCircle className="w-12 h-12" />
        <p className="text-xl">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 md:p-12 pt-24 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent mb-4">
          Available Opportunities
        </h1>
        <p className="text-zinc-400 text-lg">
          Discover and apply to the latest placement drives at NITS.
        </p>
      </motion.div>

      {jobs.length === 0 && (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
          <Briefcase className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 text-xl font-medium">No jobs posted yet.</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {jobs.map((job, index) => {
            const isApplied = appliedJobs.has(job._id);
            const isInterested = interestedJobs.has(job._id);

            return (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 flex flex-col h-full group hover:border-indigo-500/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {job.company}
                    </h2>
                    <p className="text-lg text-zinc-400 font-medium">{job.role}</p>
                  </div>
                  {job.jdPdfUrl && (
                    <a
                      href={job.jdPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                      title="View JD"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>

                <div className="space-y-3 mb-6 flex-grow">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString('en-GB') : "No deadline"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <GraduationCap className="w-4 h-4 text-pink-400" />
                    <span>CGPA &gt; {job.minCgpa ?? "N/A"}</span>
                  </div>
                </div>

                {job.description && (
                  <div className="mb-6 p-4 bg-black/20 rounded-xl border border-white/5 text-sm text-zinc-300 line-clamp-3">
                    {job.description}
                  </div>
                )}

                <div className="flex gap-3 mt-auto">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleInterest(job._id)}
                    className={cn(
                      "p-3 rounded-xl transition-all border",
                      isInterested
                        ? "bg-pink-600/20 border-pink-600/50 text-pink-400"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                    )}
                    title="Mark as Interested"
                  >
                    <Heart className={cn("w-5 h-5", isInterested && "fill-current")} />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleApply(job._id)}
                    disabled={isApplied}
                    className={cn(
                      "flex-1 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2",
                      isApplied
                        ? "bg-green-500/20 border border-green-500/30 text-green-400 cursor-default"
                        : "bg-white text-black hover:bg-indigo-50 border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                    )}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle className="w-5 h-5" /> Applied
                      </>
                    ) : (
                      "Apply Now"
                    )}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
