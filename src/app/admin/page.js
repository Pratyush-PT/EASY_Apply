"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase, FileText, Users, TrendingUp,
  ArrowRight, Clock, CheckCircle,
} from "lucide-react";

import { motion } from "framer-motion";

function StatCard({ label, value, icon: Icon, accentColor, href, hoverColor = "hover:shadow-md hover:-translate-y-0.5" }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeInOut" } }
      }}
      className={`bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm transition-all duration-300 ${hoverColor}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 tracking-tight">{value ?? 0}</p>
      {
        href && (
          <Link
            href={href}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors font-medium"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )
      }
    </motion.div >
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/admin/dashboard", { credentials: "include" });
        if (!res.ok) {
          if ([401, 403].includes(res.status)) {
            router.push("/login");
            return;
          }
          throw new Error();
        }
        const data = await res.json();
        if (isMounted) {
          setStats(data.stats);
          setRecentApplications(data.recentApplications || []);
          setRecentJobs(data.recentJobs || []);
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDashboardData();
    return () => { isMounted = false; };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of placements activity and key metrics.</p>
      </div>

      {/* Stat Cards */}
      <motion.div
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatCard label="Total Jobs" value={stats?.totalJobs} icon={Briefcase} accentColor="bg-indigo-50 text-indigo-600" href="/admin/jobs" />
        <StatCard label="Applications" value={stats?.totalApplications} icon={FileText} accentColor="bg-emerald-50 text-emerald-600" href="/admin/applications" />
        <StatCard label="Students" value={stats?.totalStudents} icon={Users} accentColor="bg-purple-50 text-purple-600" />
        <StatCard label="Interested" value={stats?.interestedNotApplied} icon={TrendingUp} accentColor="bg-amber-50 text-amber-600" />
      </motion.div>

      {/* Stats Summary Row */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 mb-8">
        <h2 className="text-xs font-semibold text-slate-500 mb-5 uppercase tracking-wider">Application Summary</h2>
        <div className="flex flex-col gap-6 sm:grid sm:grid-cols-2 sm:gap-6 sm:divide-x divide-slate-100">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Students who applied</p>
            <p className="text-3xl font-bold text-emerald-600 tracking-tight">{stats?.appliedCount ?? 0}</p>
          </div>
          <div className="sm:pl-6 pt-6 border-t border-slate-100 sm:pt-0 sm:border-t-0">
            <p className="text-sm font-medium text-slate-500 mb-1">Interested, not applied</p>
            <p className="text-3xl font-bold text-amber-600 tracking-tight">{stats?.interestedNotApplied ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Recent Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Jobs */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-0 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">Recent Jobs</h2>
            <Link href="/admin/jobs" className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentJobs.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 px-5 text-center bg-white">No jobs posted yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 bg-white">
              {recentJobs.map((job) => (
                <div key={job._id} className="group flex items-center gap-4 py-3.5 px-5 hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-indigo-100 transition-all duration-200">
                    <Briefcase className="w-4.5 h-4.5 text-indigo-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{job.company}</p>
                    <p className="text-sm text-slate-500 truncate mt-0.5">{job.role}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-400 flex-shrink-0">
                    {new Date(job.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-0 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">Recent Applications</h2>
            <Link href="/admin/applications" className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentApplications.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 px-5 text-center bg-white">No applications yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 bg-white">
              {recentApplications.map((app) => (
                <div key={app._id} className="group flex items-center gap-4 py-3.5 px-5 hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-emerald-100 transition-all duration-200">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate tracking-tight">
                      {app.studentId?.name || app.name || "Unknown"}
                    </p>
                    <p className="text-sm text-slate-500 truncate mt-0.5">
                      {app.jobId?.role} <span className="text-slate-400 mx-1">•</span> {app.jobId?.company}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-400 flex-shrink-0">
                    {new Date(app.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
