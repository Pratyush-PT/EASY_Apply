"use client";

import { useEffect, useState } from "react";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [interestedJobs, setInterestedJobs] = useState(new Set());

  // 🔹 Fetch all jobs
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

    fetchJobs();
  }, []);

  // 🔹 Fetch already applied jobs and interests
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch applied jobs
        const appsRes = await fetch("/api/applications/me", {
          credentials: "include",
        });
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setAppliedJobs(() => {
            const set = new Set();
            appsData.forEach((app) => set.add(app.jobId));
            return set;
          });
        }

        // Fetch interested jobs
        const interestsRes = await fetch("/api/interests", {
          credentials: "include",
        });
        if (interestsRes.ok) {
          const interestsData = await interestsRes.json();
          setInterestedJobs(() => {
            const set = new Set();
            interestsData.interests?.forEach((interest) =>
              set.add(interest.jobId)
            );
            return set;
          });
        }

        // Check for deadline notifications
        const notificationsRes = await fetch("/api/notifications/check", {
          credentials: "include",
        });
        if (notificationsRes.ok) {
          const notificationsData = await notificationsRes.json();
          if (notificationsData.notifications?.length > 0) {
            notificationsData.notifications.forEach((notif) => {
              const deadlineDate = new Date(notif.deadline).toLocaleDateString();
              alert(
                `⏰ Reminder: ${notif.company} - ${notif.role} deadline is approaching!\nDeadline: ${deadlineDate}\n\nDon't forget to apply!`
              );
            });
          }
        }
      } catch {
        console.error("Failed to fetch data");
      }
    };

    fetchData();
  }, []);

  // 🔹 APPLY HANDLER
  const handleApply = async (jobId) => {
    // If already applied, show message and return
    if (appliedJobs.has(jobId)) {
      alert("Already applied");
      return;
    }

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      const data = await res.json();

      // ✅ Success
      if (res.ok) {
        setAppliedJobs((prev) => {
          const next = new Set(prev);
          next.add(jobId);
          return next;
        });
        alert("Application submitted successfully!");
      } else if (res.status === 409 && data.alreadyApplied) {
        // Already applied (edge case)
        setAppliedJobs((prev) => {
          const next = new Set(prev);
          next.add(jobId);
          return next;
        });
        alert("Already applied");
      } else {
        alert(data.error || "Failed to apply");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong while applying");
    }
  };

  // 🔹 INTEREST HANDLER
  const handleInterest = async (jobId) => {
    const isInterested = interestedJobs.has(jobId);

    try {
      if (isInterested) {
        // Remove interest
        const res = await fetch(`/api/interests?jobId=${jobId}`, {
          method: "DELETE",
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
          setInterestedJobs((prev) => {
            const next = new Set(prev);
            next.delete(jobId);
            return next;
          });
          alert("Removed from interested list");
        } else {
          alert(data.error || "Failed to remove interest");
        }
      } else {
        // Add interest
        const res = await fetch("/api/interests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ jobId }),
        });

        const data = await res.json();

        if (res.ok) {
          setInterestedJobs((prev) => {
            const next = new Set(prev);
            next.add(jobId);
            return next;
          });
          alert("Marked as interested! You'll be notified before the deadline.");
        } else {
          const errorMsg = data.error || "Failed to mark interest";
          alert(errorMsg);
          if (res.status === 401) {
            console.error("Authentication error - user may need to log in again");
          }
        }
      }
    } catch (error) {
      console.error("Interest handler error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

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
        {jobs.map((job) => {
          const isApplied = appliedJobs.has(job._id);
          const isInterested = interestedJobs.has(job._id);

          return (
            <div
              key={job._id}
              className="border border-zinc-700 bg-zinc-900 rounded-lg p-5"
            >
              <h2 className="text-xl font-semibold">{job.company}</h2>
              <p className="text-lg text-gray-300">{job.role}</p>

              {job.description && (
                <div className="mt-3 p-3 bg-zinc-800 rounded border border-zinc-700">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>
              )}

              <p className="text-sm text-gray-400 mt-3">
                Deadline:{" "}
                {job.deadline
                  ? new Date(job.deadline).toLocaleDateString()
                  : "No deadline set"}
              </p>

              <p className="mt-3">
                <strong>Eligible Branches:</strong>{" "}
                {job.eligibleBranches.join(", ")}
              </p>

              <p className="mt-1">
                <strong>Minimum CGPA:</strong>{" "}
                {job.minCgpa ?? "N/A"}
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

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => handleInterest(job._id)}
                  className={`px-4 py-2 rounded text-white ${isInterested
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                  {isInterested ? "Interested ✓" : "Interested"}
                </button>
                <button
                  onClick={() => handleApply(job._id)}
                  disabled={isApplied}
                  className={`px-4 py-2 rounded text-white ${isApplied
                    ? "bg-gray-600 cursor-not-allowed opacity-60"
                    : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                  {isApplied ? "Applied" : "Apply"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

