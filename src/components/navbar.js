'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Menu,
    X,
    Briefcase,
    User,
    LogOut,
    Home,
    UserPlus,
    LogIn,
    CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function NavLink({ href, children, icon: Icon, active }) {
    return (
        <Link
            href={href}
            className={cn(
                'relative group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                active
                    ? 'text-slate-800 bg-gray-100 shadow-sm'
                    : 'text-gray-600 hover:text-slate-800 hover:bg-gray-50',
            )}
        >
            {Icon && <Icon className='w-4 h-4' />}
            {children}

            {active && (
                <motion.div
                    layoutId='navbar-indicator'
                    className='absolute inset-0 rounded-full border border-gray-200'
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
            )}
        </Link>
    )
}

export default function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const checkAuth = async () => {
            const studentPages = ['/jobs', '/applications', '/profile']
            if (studentPages.some((page) => pathname.startsWith(page))) {
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
            setIsLoggedIn(false)
            router.push('/login')
        } catch {
            setIsLoggedIn(false)
            router.push('/login')
        }
    }

    const isActive = (path) => pathname === path

    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent',
                scrolled || isOpen
                    ? 'bg-white/95 backdrop-blur-sm border-gray-200 shadow-sm'
                    : 'bg-transparent',
            )}
        >
            <div className='max-w-7xl mx-auto px-6 h-20 flex items-center justify-between'>
                {/* Logo */}
                <Link href={isLoggedIn ? '/jobs' : '/'} className='relative group'>
                    <span className='text-2xl font-bold text-slate-800 group-hover:text-indigo-600 transition-all'>
                        EasyApply
                    </span>
                    <div className='absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-indigo-500 to-pink-500 group-hover:w-full transition-all duration-300' />
                </Link>

                {/* Desktop Nav */}
                <div className='hidden md:flex items-center gap-2'>
                    {isLoggedIn ? (
                        <>
                            <NavLink href='/jobs' icon={Briefcase}>
                                Jobs
                            </NavLink>
                            <NavLink href='/applications' icon={CheckCircle}>
                                My Applications
                            </NavLink>
                            <NavLink href='/profile' icon={User}>
                                Profile
                            </NavLink>
                            <button
                                onClick={handleLogout}
                                className='ml-4 flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all duration-300 transform hover:scale-105'
                            >
                                <LogOut className='w-4 h-4' />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink href='/' icon={Home}>
                                Home
                            </NavLink>
                            <NavLink href='/signup' icon={UserPlus}>
                                Signup
                            </NavLink>
                            <Link
                                href='/login'
                                className='ml-2 px-6 py-2 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                            >
                                Login
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className='md:hidden text-slate-800 p-2'
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
                </button>
            </div>

            {/* Mobile Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className='md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200 overflow-hidden'
                    >
                        <div className='flex flex-col p-6 space-y-4'>
                            {isLoggedIn ? (
                                <>
                                    <MobileLink href='/jobs' icon={Briefcase}>
                                        Jobs
                                    </MobileLink>
                                    <MobileLink href='/applications' icon={CheckCircle}>
                                        Applications
                                    </MobileLink>
                                    <MobileLink href='/profile' icon={User}>
                                        Profile
                                    </MobileLink>
                                    <button
                                        onClick={handleLogout}
                                        className='flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-100 text-red-600 border border-red-200'
                                    >
                                        <LogOut className='w-4 h-4' /> Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <MobileLink href='/' icon={Home}>
                                        Home
                                    </MobileLink>
                                    <MobileLink href='/signup' icon={UserPlus}>
                                        Signup
                                    </MobileLink>
                                    <MobileLink href='/login' icon={LogIn}>
                                        Login
                                    </MobileLink>
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
    const isActive = pathname === href

    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-3 p-3 rounded-xl transition-all',
                isActive
                    ? 'bg-gray-100 text-slate-800'
                    : 'text-gray-600 hover:text-slate-800 hover:bg-gray-50',
            )}
        >
            {Icon && <Icon className='w-5 h-5' />}
            {children}
        </Link>
    )
}
