"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/admin/dashboard", {
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await res.json();
        setStats(data.stats);
        setRecentApplications(data.recentApplications || []);
        setRecentJobs(data.recentJobs || []);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="p-6 text-white">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700">
          <h3 className="text-sm text-zinc-400 mb-2">Total Jobs</h3>
          <p className="text-3xl font-bold text-blue-400">{stats?.totalJobs || 0}</p>
          <Link
            href="/admin/jobs"
            className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block"
          >
            View all →
          </Link>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700">
          <h3 className="text-sm text-zinc-400 mb-2">Total Applications</h3>
          <p className="text-3xl font-bold text-green-400">{stats?.totalApplications || 0}</p>
          <Link
            href="/admin/applications"
            className="text-sm text-green-400 hover:text-green-300 mt-2 inline-block"
          >
            View all →
          </Link>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700">
          <h3 className="text-sm text-zinc-400 mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-purple-400">{stats?.totalStudents || 0}</p>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700">
          <h3 className="text-sm text-zinc-400 mb-2">Interested (Not Applied)</h3>
          <p className="text-3xl font-bold text-orange-400">{stats?.interestedNotApplied || 0}</p>
        </div>
      </div>

      {/* Application Statistics */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700 mb-8">
        <h2 className="text-xl font-semibold mb-4">Application Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-zinc-400">Students Who Applied</p>
            <p className="text-2xl font-bold text-green-400">{stats?.appliedCount || 0}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Interested But Not Applied</p>
            <p className="text-2xl font-bold text-orange-400">{stats?.interestedNotApplied || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Jobs</h2>
            <Link
              href="/admin/jobs"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View all →
            </Link>
          </div>
          {recentJobs.length === 0 ? (
            <p className="text-zinc-400">No jobs posted yet</p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job._id}
                  className="p-3 bg-zinc-800 rounded border border-zinc-700"
                >
                  <p className="font-medium">{job.company} - {job.role}</p>
                  <p className="text-sm text-zinc-400">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Applications</h2>
            <Link
              href="/admin/applications"
              className="text-sm text-green-400 hover:text-green-300"
            >
              View all →
            </Link>
          </div>
          {recentApplications.length === 0 ? (
            <p className="text-zinc-400">No applications yet</p>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div
                  key={app._id}
                  className="p-3 bg-zinc-800 rounded border border-zinc-700"
                >
                  <p className="font-medium">
                    {app.studentId?.name || app.name || "Unknown"}
                  </p>
                  <p className="text-sm text-zinc-400">
                    Applied for {app.jobId?.role} @ {app.jobId?.company}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
