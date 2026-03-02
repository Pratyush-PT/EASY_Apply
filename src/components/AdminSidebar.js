'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, LayoutDashboard, Briefcase, FileText, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

function SidebarLink({ href, icon: Icon, label, isExpanded, exact = false }) {
    const pathname = usePathname()
    const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

    return (
        <Link
            href={href}
            className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 group',
                active ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            )}
            title={!isExpanded ? label : undefined}
        >
            {active && (
                <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
            )}
            <Icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />

            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap overflow-hidden"
                        transition={{ duration: 0.2 }}
                    >
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>
        </Link>
    )
}

function MobileLink({ href, children, icon: Icon, exact = false, setIsMobileOpen }) {
    const pathname = usePathname()
    const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

    return (
        <Link
            href={href}
            onClick={() => setIsMobileOpen(false)}
            className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            )}
        >
            {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
            {children}
        </Link>
    )
}

export default function AdminSidebar() {
    const router = useRouter()
    const [isExpanded, setIsExpanded] = useState(true)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
        } catch { }
        router.push('/login')
    }

    // Desktop Sidebar
    const SidebarContent = (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="h-16 flex items-center px-4 border-b border-slate-200 justify-between">
                <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-200">
                        <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <AnimatePresence initial={false}>
                        {isExpanded && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="font-semibold text-slate-900 tracking-tight whitespace-nowrap overflow-hidden"
                            >
                                EasyApply <span className="text-slate-400 font-normal ml-0.5">Admin</span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            {/* Nav Links */}
            <div className="flex-1 px-3 py-6 flex flex-col gap-1.5 overflow-y-auto">
                <SidebarLink href="/admin" icon={LayoutDashboard} label="Dashboard" isExpanded={isExpanded} exact />
                <SidebarLink href="/admin/jobs" icon={Briefcase} label="Jobs" isExpanded={isExpanded} />
                <SidebarLink href="/admin/applications" icon={FileText} label="Applications" isExpanded={isExpanded} />
            </div>

            {/* Collapse Toggle (Desktop only) */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute -right-3 top-20 bg-white border border-slate-200 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:shadow-sm shadow-slate-100 transition-all z-10 hidden md:block"
            >
                {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
        </div>
    )

    return (
        <>
            {/* Desktop Wrapper */}
            <motion.aside
                initial={false}
                animate={{ width: isExpanded ? 240 : 80 }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="hidden md:block h-screen sticky top-0 left-0 z-40 bg-white flex-shrink-0 border-r border-slate-200"
            >
                {SidebarContent}
            </motion.aside>

            {/* Mobile Topbar */}
            <div className="md:hidden flex-shrink-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-50">
                <Link href="/admin" className="flex items-center gap-2 select-none">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                    <span className="text-base font-semibold text-slate-900 tracking-tight">
                        EasyApply <span className="text-slate-500 font-normal">Admin</span>
                    </span>
                </Link>
                <div className="flex items-center gap-1">
                    <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
                        <LogOut className="w-5 h-5" />
                    </button>
                    <div className="w-px h-5 bg-slate-200 mx-1" />
                    <button
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu (Matches User Side) */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden absolute top-16 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-md overflow-hidden"
                    >
                        <div className="px-6 py-4 flex flex-col gap-1">
                            <MobileLink href="/admin" icon={LayoutDashboard} exact setIsMobileOpen={setIsMobileOpen}>Dashboard</MobileLink>
                            <MobileLink href="/admin/jobs" icon={Briefcase} setIsMobileOpen={setIsMobileOpen}>Jobs</MobileLink>
                            <MobileLink href="/admin/applications" icon={FileText} setIsMobileOpen={setIsMobileOpen}>Applications</MobileLink>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
