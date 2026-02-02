"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Calendar, CheckCircle, ExternalLink, Heart, GraduationCap, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Modal from "@/components/Modal";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [interestedJobs, setInterestedJobs] = useState(new Set());

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    primaryLabel: "OK",
    primaryAction: null,
    secondaryLabel: null,
    secondaryAction: null,
  });

  const showModal = (options) => {
    setModal({
      isOpen: true,
      title: options.title || "",
      message: options.message || "",
      type: options.type || "info",
      primaryLabel: options.primaryLabel || "OK",
      primaryAction: options.primaryAction || null,
      secondaryLabel: options.secondaryLabel || null,
      secondaryAction: options.secondaryAction || null,
    });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

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
            const notif = notificationsData.notifications[0];
            const deadlineDate = new Date(notif.deadline).toLocaleDateString("en-GB");
            showModal({
              title: "⏰ Deadline Reminder",
              message: `${notif.company} - ${notif.role} deadline is approaching!\n\nDeadline: ${deadlineDate}\n\nDon't forget to apply!`,
              type: "warning",
              primaryLabel: "Got it",
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
    if (appliedJobs.has(jobId)) {
      showModal({
        title: "Already Applied",
        message: "You have already applied to this job.",
        type: "info",
      });
      return;
    }

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();

      if (res.ok || (res.status === 409 && data.alreadyApplied)) {
        setAppliedJobs((prev) => new Set(prev).add(jobId));
        showModal({
          title: res.ok ? "Application Submitted!" : "Already Applied",
          message: res.ok
            ? "Your application has been submitted successfully."
            : "You have already applied to this job.",
          type: res.ok ? "success" : "info",
        });
      } else {
        // Check if error is about incomplete profile
        if (data.error?.toLowerCase().includes("profile") || data.error?.toLowerCase().includes("complete")) {
          showModal({
            title: "Complete Your Profile",
            message: data.error || "Please complete your profile before applying.",
            type: "warning",
            primaryLabel: "Go to Profile",
            primaryAction: () => {
              closeModal();
              router.push("/profile");
            },
            secondaryLabel: "Cancel",
            secondaryAction: closeModal,
          });
        } else {
          showModal({
            title: "Application Failed",
            message: data.error || "Failed to apply. Please try again.",
            type: "error",
          });
        }
      }
    } catch {
      showModal({
        title: "Error",
        message: "Something went wrong while applying. Please try again.",
        type: "error",
      });
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
        if (!isInterested) {
          showModal({
            title: "Marked as Interested!",
            message: "You'll be notified before the deadline.",
            type: "success",
          });
        }
      } else {
        showModal({
          title: "Error",
          message: "Failed to update interest. Please try again.",
          type: "error",
        });
      }
    } catch {
      showModal({
        title: "Error",
        message: "Something went wrong. Please try again.",
        type: "error",
      });
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
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600 gap-4">
        <AlertCircle className="w-12 h-12" />
        <p className="text-xl">{error}</p>
      </div>
    )
  }

  return (
    <>
      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        primaryLabel={modal.primaryLabel}
        primaryAction={modal.primaryAction}
        secondaryLabel={modal.secondaryLabel}
        secondaryAction={modal.secondaryAction}
      />

      <div className="min-h-screen p-6 md:p-12 pt-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Available Opportunities
          </h1>
          <p className="text-gray-600 text-lg">
            Discover and apply to the latest placement drives at NITS.
          </p>
        </motion.div>

        {jobs.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-xl font-medium">No jobs posted yet.</p>
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
                  className="bg-white rounded-2xl p-6 flex flex-col h-full group hover:border-indigo-300 border border-gray-200 shadow-sm transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {job.company}
                      </h2>
                      <p className="text-lg text-gray-600 font-medium">{job.role}</p>
                    </div>
                    {job.jdPdfUrl && (
                      <a
                        href={job.jdPdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:text-slate-800 hover:bg-gray-200 transition-all"
                        title="View JD"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>

                  <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span>Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString('en-GB') : "No deadline"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GraduationCap className="w-4 h-4 text-pink-500" />
                      <span>CGPA &gt; {job.minCgpa ?? "N/A"}</span>
                    </div>
                  </div>

                  {job.description && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 line-clamp-3">
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
                          ? "bg-pink-100 border-pink-300 text-pink-600"
                          : "bg-gray-100 border-gray-200 text-gray-500 hover:text-slate-800 hover:bg-gray-200"
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
                          ? "bg-green-100 border border-green-300 text-green-600 cursor-default"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent shadow-sm"
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
    </>
  );
}
