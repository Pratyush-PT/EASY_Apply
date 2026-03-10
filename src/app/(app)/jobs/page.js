'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase,
  Calendar,
  CheckCircle,
  ExternalLink,
  Heart,
  GraduationCap,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Modal from '@/components/Modal'

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [appliedJobs, setAppliedJobs] = useState(new Set())
  const [interestedJobs, setInterestedJobs] = useState(new Set())
  const [jobModal, setJobModal] = useState(null)

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    primaryLabel: 'OK',
    primaryAction: null,
    secondaryLabel: null,
    secondaryAction: null,
  })

  const showModal = (options) =>
    setModal({
      isOpen: true,
      title: '',
      message: '',
      type: 'info',
      primaryLabel: 'OK',
      primaryAction: null,
      secondaryLabel: null,
      secondaryAction: null,
      ...options,
    })
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }))

  useEffect(() => {
    let isMounted = true

    const loadAllData = async () => {
      setLoading(true)
      try {
        const [jobsRes, appsRes, interestsRes, notifRes] = await Promise.allSettled([
          fetch('/api/jobs'),
          fetch('/api/applications/me', { credentials: 'include' }),
          fetch('/api/interests', { credentials: 'include' }),
          fetch('/api/notifications/check', { credentials: 'include' }),
        ])

        if (!isMounted) return

        if (jobsRes.status === 'fulfilled' && jobsRes.value.ok) {
          setJobs(await jobsRes.value.json())
        } else {
          setError('Unable to load jobs. Please refresh.')
        }

        if (appsRes.status === 'fulfilled' && appsRes.value.ok) {
          const d = await appsRes.value.json()
          setAppliedJobs(new Set(d.map((a) => a.jobId)))
        }

        if (interestsRes.status === 'fulfilled' && interestsRes.value.ok) {
          const d = await interestsRes.value.json()
          setInterestedJobs(new Set(d.interests?.map((i) => i.jobId)))
        }

        if (notifRes.status === 'fulfilled' && notifRes.value.ok) {
          const nd = await notifRes.value.json()
          if (nd.notifications?.length > 0) {
            const n = nd.notifications[0]
            showModal({
              title: 'Deadline Reminder',
              message: `${n.company} — ${n.role}\nDeadline: ${new Date(n.deadline).toLocaleDateString('en-GB')}\n\nDon't forget to apply!`,
              type: 'warning',
              primaryLabel: 'Got it',
            })
          }
        }
      } catch (err) {
        if (isMounted) setError('A network error occurred.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadAllData()
    return () => {
      isMounted = false
    }
  }, [])

  const handleApply = async (jobId) => {
    if (appliedJobs.has(jobId)) {
      showModal({
        title: 'Already Applied',
        message: 'You have already applied to this job.',
        type: 'info',
      })
      return
    }
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })
      const data = await res.json()

      if (res.ok || (res.status === 409 && data.alreadyApplied)) {
        setAppliedJobs((prev) => new Set(prev).add(jobId))
        showModal({
          title: res.ok ? 'Application Submitted' : 'Already Applied',
          message: res.ok
            ? 'Your application was submitted successfully.'
            : 'You have already applied to this job.',
          type: res.ok ? 'success' : 'info',
        })
      } else if (
        data.error?.toLowerCase().includes('profile') ||
        data.error?.toLowerCase().includes('complete')
      ) {
        showModal({
          title: 'Complete Your Profile',
          message: data.error || 'Please complete your profile before applying.',
          type: 'warning',
          primaryLabel: 'Go to Profile',
          primaryAction: () => {
            closeModal()
            router.push('/profile')
          },
          secondaryLabel: 'Cancel',
          secondaryAction: closeModal,
        })
      } else {
        showModal({
          title: 'Application Failed',
          message: data.error || 'Failed to apply.',
          type: 'error',
        })
      }
    } catch {
      showModal({
        title: 'Error',
        message: 'Something went wrong. Please try again.',
        type: 'error',
      })
    }
  }

  const handleInterest = async (jobId) => {
    const isInterested = interestedJobs.has(jobId)
    try {
      const res = await fetch(isInterested ? `/api/interests?jobId=${jobId}` : '/api/interests', {
        method: isInterested ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: isInterested ? undefined : JSON.stringify({ jobId }),
      })
      if (res.ok) {
        setInterestedJobs((prev) => {
          const s = new Set(prev)
          isInterested ? s.delete(jobId) : s.add(jobId)
          return s
        })
      }
    } catch {}
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-16 gap-3 text-gray-500">
        <AlertCircle className="w-8 h-8 text-gray-400" />
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <>
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

      <div className="min-h-screen pt-24 pb-16 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Available Opportunities</h1>
          <p className="page-subtitle">
            Discover and apply to the latest placement drives at NITS.
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="p-4 flex flex-col items-center justify-center min-h-[50vh] text-center">
            <Briefcase className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-400 font-medium">No jobs posted yet.</p>
            <p className="text-xs text-gray-400 mt-1">Check back soon.</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
            }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {jobs.map((job, index) => {
                const isApplied = appliedJobs.has(job._id)
                const isInterested = interestedJobs.has(job._id)

                return (
                  <motion.div
                    key={job._id}
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.35, ease: 'easeInOut' },
                      },
                    }}
                    whileHover={{
                      y: -4,
                      scale: 1.02,
                      transition: { duration: 0.25, ease: 'easeInOut' },
                    }}
                    className="card flex flex-col gap-4 hover:border-indigo-200 shadow-sm hover:shadow-lg cursor-pointer transition-colors duration-250 ease-out group"
                    onClick={() => setJobModal(job)}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-semibold text-gray-900 text-base leading-tight truncate">
                          {job.role}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500 group-hover:text-indigo-600 transition-colors">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>Click to view company</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleInterest(job._id)
                          }}
                          title={isInterested ? 'Remove interest' : 'Mark as interested'}
                          className={cn(
                            'p-1.5 rounded-lg transition-all duration-150',
                            isInterested
                              ? 'text-rose-500 bg-rose-50'
                              : 'text-gray-400 hover:text-rose-500 hover:bg-rose-50',
                          )}
                        >
                          <Heart className={cn('w-4 h-4', isInterested && 'fill-current')} />
                        </button>
                        {job.jdPdfUrl && (
                          <a
                            href={job.jdPdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="View JD PDF"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>
                          {job.deadline
                            ? 'Deadline: ' + new Date(job.deadline).toLocaleDateString('en-GB')
                            : 'No deadline'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <GraduationCap className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>Min. CGPA: {job.minCgpa ?? 'N/A'}</span>
                      </div>
                    </div>

                    {/* Branches */}
                    {job.eligibleBranches?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {job.eligibleBranches.map((branch) => (
                          <span key={branch} className="badge badge-indigo text-xs">
                            {branch}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Description */}
                    {job.description && (
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 border-t border-gray-100 pt-3">
                        {job.description}
                      </p>
                    )}

                    {/* Apply */}
                    <div className="mt-auto pt-2 border-t border-gray-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApply(job._id)
                        }}
                        disabled={isApplied}
                        className={cn(
                          'w-full btn font-medium text-sm',
                          isApplied
                            ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                            : 'btn-primary',
                        )}
                        style={{ height: '40px', borderRadius: '8px' }}
                      >
                        {isApplied ? (
                          <>
                            <CheckCircle className="w-4 h-4" /> Applied
                          </>
                        ) : (
                          <>
                            Apply Now <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Job Details Modal */}
      <AnimatePresence>
        {jobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setJobModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 overflow-y-auto">
                <div className="flex justify-between items-start gap-4 mb-6">
                  <div>
                    <h2 className="text-3xl font-semibold text-gray-900 leading-tight">
                      {jobModal.company}
                    </h2>
                    <p className="text-lg text-gray-600 font-medium mt-1">{jobModal.role}</p>
                  </div>
                  <button
                    onClick={() => setJobModal(null)}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-gray-500 shrink-0"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                        Deadline
                      </p>
                      <p className="font-medium text-gray-900">
                        {jobModal.deadline
                          ? new Date(jobModal.deadline).toLocaleDateString('en-GB')
                          : 'No deadline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <GraduationCap className="w-5 h-5 text-indigo-500" />
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                        Min CGPA
                      </p>
                      <p className="font-medium text-gray-900">{jobModal.minCgpa ?? 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {jobModal.eligibleBranches?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Eligible Branches</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {jobModal.eligibleBranches.map((branch) => (
                        <span
                          key={branch}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium border border-indigo-100"
                        >
                          {branch}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {jobModal.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Job Description</h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {jobModal.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl items-center mt-auto">
                {jobModal.jdPdfUrl && (
                  <a
                    href={jobModal.jdPdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-700 px-4 py-2 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> View JD
                  </a>
                )}
                <button
                  onClick={() => {
                    handleApply(jobModal._id)
                    setJobModal(null)
                  }}
                  disabled={appliedJobs.has(jobModal._id)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:scale-[1.02] hover:bg-indigo-700 disabled:hover:scale-100 disabled:bg-green-50 disabled:border disabled:border-green-200 disabled:text-green-700 transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
                >
                  {appliedJobs.has(jobModal._id) ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> Applied
                    </>
                  ) : (
                    'Apply Now'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
