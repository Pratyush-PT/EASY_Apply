'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Calendar,
  GraduationCap,
  Users,
  TrendingUp,
  Briefcase,
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null) // Added setError state
  const router = useRouter()

  useEffect(() => {
    let isMounted = true
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/admin/jobs', { credentials: 'include' })
        if (!res.ok) {
          if ([401, 403].includes(res.status)) {
            router.push('/login')
            return
          }
          throw new Error('Failed to fetch jobs')
        }
        const data = await res.json()
        if (isMounted) setJobs(data.jobs || [])
      } catch (err) {
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchJobs()
    return () => {
      isMounted = false
    }
  }, [router])

  const handleDelete = async (jobId) => {
    setDeletingId(jobId)
    try {
      await fetch(`/api/admin/jobs/${jobId}`, { method: 'DELETE' })
      setJobs((prev) => prev.filter((j) => j._id !== jobId))
    } catch {
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Jobs</h1>
          <p className="text-sm text-slate-500 mt-1">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} posted
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/jobs/create')}
          className="btn btn-primary w-full sm:w-auto flex justify-center"
        >
          <Plus className="w-4 h-4" />
          Create Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
          <Briefcase className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-500">No jobs posted yet.</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="space-y-3"
        >
          {jobs.map((job) => (
            <motion.div
              key={job._id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeInOut' } },
              }}
              className="bg-white border border-slate-200 shadow-sm hover:shadow-md rounded-2xl p-4 sm:p-5 hover:border-indigo-100 transition-all duration-200 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <h2 className="font-semibold text-slate-900 text-base">{job.company}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{job.role}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {job.jdPdfUrl && (
                    <a
                      href={job.jdPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View JD PDF"
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => router.push(`/admin/jobs/${job._id}/edit`)}
                    title="Edit"
                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    disabled={deletingId === job._id}
                    title="Delete"
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-500 mb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {job.deadline
                    ? 'Deadline: ' + new Date(job.deadline).toLocaleDateString('en-GB')
                    : 'No deadline'}
                </div>
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  Min. CGPA: {job.minCgpa ?? 'N/A'}
                </div>
                {job.eligibleBranches?.length > 0 && (
                  <span className="text-slate-500">{job.eligibleBranches.join(', ')}</span>
                )}
              </div>

              {job.description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>
              )}

              <div className="flex gap-6 pt-4 border-t border-slate-100 text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>
                    Applied:{' '}
                    <span className="font-semibold text-emerald-600">{job.appliedCount || 0}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span>
                    Interested:{' '}
                    <span className="font-semibold text-amber-600">
                      {job.interestedNotApplied || 0}
                    </span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
