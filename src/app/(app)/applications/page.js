'use client'

import { useEffect, useState } from 'react'
import { Briefcase, Calendar, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'

const STATUS_CONFIG = {
    Applied: {
        label: 'Applied',
        icon: CheckCircle,
        className: 'badge badge-indigo',
    },
    Shortlisted: {
        label: 'Shortlisted',
        icon: Clock,
        className: 'badge badge-green',
    },
    Rejected: {
        label: 'Rejected',
        icon: XCircle,
        className: 'badge badge-red',
    },
}

export default function ApplicationsPage() {
    const [applications, setApplications] = useState([])
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [appsRes, jobsRes] = await Promise.all([
                    fetch('/api/applications/me'),
                    fetch('/api/jobs'),
                ])
                if (!appsRes.ok || !jobsRes.ok) throw new Error()
                setApplications(await appsRes.json())
                setJobs(await jobsRes.json())
            } catch {
                setError('Unable to load applications.')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

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

    if (applications.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center pt-16 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <Briefcase className="w-6 h-6 text-gray-400" />
                </div>
                <p className="font-medium text-gray-900 mb-1">No applications yet</p>
                <p className="text-sm text-gray-500">Head to the Jobs page to find and apply to openings.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-24 pb-16 px-6 max-w-4xl mx-auto">
            <div className="page-header">
                <h1 className="page-title">My Applications</h1>
                <p className="page-subtitle">{applications.length} application{applications.length !== 1 ? 's' : ''} submitted</p>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block card p-0 overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-0 text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3 border-b border-gray-100">
                    <span>Company</span>
                    <span>Role</span>
                    <span>Applied</span>
                    <span>Status</span>
                </div>
                <div className="divide-y divide-gray-50">
                    {applications.map((app) => {
                        const job = jobs.find((j) => j._id === app.jobId)
                        if (!job) return null
                        const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.Applied
                        const StatusIcon = status.icon

                        return (
                            <div
                                key={app._id}
                                className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                        <Briefcase className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <span className="font-medium text-gray-900 text-sm truncate">{job.company}</span>
                                </div>
                                <span className="text-sm text-gray-500 truncate">{job.role}</span>
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(app.createdAt || Date.now()).toLocaleDateString('en-GB')}
                                </div>
                                <span className={status.className}>
                                    <StatusIcon className="w-3 h-3" />
                                    {status.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
                {applications.map((app) => {
                    const job = jobs.find((j) => j._id === app.jobId)
                    if (!job) return null
                    const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.Applied
                    const StatusIcon = status.icon

                    return (
                        <div key={app._id} className="card">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{job.company}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{job.role}</p>
                                </div>
                                <span className={status.className}>
                                    <StatusIcon className="w-3 h-3" />
                                    {status.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <Calendar className="w-3.5 h-3.5" />
                                Applied {new Date(app.createdAt || Date.now()).toLocaleDateString('en-GB')}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
