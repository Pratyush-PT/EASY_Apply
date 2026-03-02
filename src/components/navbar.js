'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, User, LogOut, Menu, X, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

function NavLink({ href, children, icon: Icon }) {
    const pathname = usePathname()
    const active = pathname === href

    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            )}
        >
            {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
            {children}
        </Link>
    )
}

export default function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            const studentPages = ['/jobs', '/applications', '/profile']
            if (studentPages.some((p) => pathname.startsWith(p))) {
                setIsLoggedIn(true)
                return
            }
            try {
                const res = await fetch('/api/me')
                setIsLoggedIn(res.ok)
            } catch {
                setIsLoggedIn(false)
            }
        }
        checkAuth()
    }, [pathname])

    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    if (pathname.startsWith('/admin')) return null

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
        } catch { }
        setIsLoggedIn(false)
        router.push('/login')
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link
                    href={isLoggedIn ? '/jobs' : '/'}
                    className="flex items-center gap-2 select-none"
                >
                    <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                    <span className="text-base font-semibold text-gray-900 tracking-tight">
                        EasyApply
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {isLoggedIn ? (
                        <>
                            <NavLink href="/jobs" icon={Briefcase}>Jobs</NavLink>
                            <NavLink href="/applications" icon={CheckSquare}>Applications</NavLink>
                            <NavLink href="/profile" icon={User}>Profile</NavLink>

                            <div className="w-px h-5 bg-gray-200 mx-2" />

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/signup"
                                className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-150"
                            >
                                Sign up
                            </Link>
                            <Link
                                href="/login"
                                className="ml-1 btn btn-primary btn-sm"
                            >
                                Log in
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="px-6 py-4 flex flex-col gap-1">
                            {isLoggedIn ? (
                                <>
                                    <MobileLink href="/jobs" icon={Briefcase}>Jobs</MobileLink>
                                    <MobileLink href="/applications" icon={CheckSquare}>Applications</MobileLink>
                                    <MobileLink href="/profile" icon={User}>Profile</MobileLink>
                                    <hr className="my-2 border-gray-100" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <MobileLink href="/signup">Sign up</MobileLink>
                                    <MobileLink href="/login">Log in</MobileLink>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

function MobileLink({ href, children, icon: Icon }) {
    const pathname = usePathname()
    const active = pathname === href

    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
        >
            {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
            {children}
        </Link>
    )
}
