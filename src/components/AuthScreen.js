'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react'
import PasswordInput from '@/components/PasswordInput'

export default function AuthScreen({ initialView = 'login' }) {
    const router = useRouter()
    const [isLogin, setIsLogin] = useState(initialView === 'login')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    // Login Form State
    const [loginForm, setLoginForm] = useState({ email: '', password: '' })

    // Forgot Password State
    const [forgotView, setForgotView] = useState('none') // 'none', 'email', 'otp'
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotOtp, setForgotOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')

    // Signup Form State
    const [signupStep, setSignupStep] = useState(1) // 1: details, 2: otp
    const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '', otp: '' })

    // Reset error when switching views
    useEffect(() => {
        setError('')
        setMessage('')
        setForgotView('none')
    }, [isLogin])

    const handleLoginSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginForm),
            })
            const data = await res.json()

            if (res.ok) {
                const role = data.role?.toLowerCase()
                router.replace(role === 'admin' ? '/admin' : '/profile')
            } else {
                setError(data.error || 'Login failed. Please check your credentials.')
            }
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleSignupSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (signupForm.password !== signupForm.confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        const emailRegex = /^[a-zA-Z0-9._]+_ug_\d{2}@(cse|ece|ei|ee|mech|civil)\.nits\.ac\.in$/
        if (!emailRegex.test(signupForm.email)) {
            setError('Please use your institute email (e.g. name_ug_23@cse.nits.ac.in).')
            return
        }

        if (signupForm.password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: signupForm.name, email: signupForm.email, password: signupForm.password }),
            })
            const data = await res.json()

            if (res.ok && data.step === 'otp') {
                setSignupStep(2)
            } else {
                setError(data.error || data.message || 'Signup failed.')
            }
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signupForm.email, otp: signupForm.otp }),
            })
            const data = await res.json()

            if (res.ok) {
                router.replace('/profile')
            } else {
                setError(data.error || 'Verification failed.')
            }
        } catch {
            setError('Verification error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Forgot Password Handlers
    const handleForgotEmailSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail }),
            })
            const data = await res.json()
            if (res.ok) {
                setForgotView('otp')
                setMessage('OTP sent to your email.')
            } else {
                setMessage(data.error || 'Failed to send OTP.')
            }
        } catch {
            setMessage('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail, otp: forgotOtp, newPassword }),
            })
            const data = await res.json()
            if (res.ok) {
                setForgotView('none')
                setError('')
                setMessage('Password reset. Please log in.')
                setLoginForm({ email: forgotEmail, password: '' })
            } else {
                setMessage(data.error || 'Failed to reset password.')
            }
        } catch {
            setMessage('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const renderLoginForm = () => {
        if (forgotView === 'email') {
            return (
                <div className="w-full max-w-sm mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Reset password</h1>
                        <p className="text-sm text-gray-500">Enter your institute email to receive an OTP.</p>
                    </div>
                    <form onSubmit={handleForgotEmailSubmit} className="space-y-5">
                        <div>
                            <label className="input-label">Institute Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="email"
                                    className="input-field has-icon"
                                    placeholder="Empty"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    required
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                        {message && <p className={message.includes('sent') ? 'text-green-600 text-sm' : 'input-error'}>{message}</p>}
                        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                            {loading ? 'Sending…' : 'Send OTP'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setForgotView('none'); setMessage('') }}
                            className="btn btn-secondary btn-lg w-full"
                        >
                            Back to login
                        </button>
                    </form>
                </div>
            )
        }

        if (forgotView === 'otp') {
            return (
                <div className="w-full max-w-sm mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Enter OTP</h1>
                        <p className="text-sm text-gray-500">Check your email and enter the code below.</p>
                    </div>
                    <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
                        <div>
                            <label className="input-label">One-Time Password</label>
                            <input
                                type="text"
                                className="input-field font-mono text-center text-xl tracking-widest"
                                placeholder=""
                                value={forgotOtp}
                                onChange={(e) => setForgotOtp(e.target.value)}
                                required
                                maxLength={6}
                                autoFocus
                                autoComplete="off"
                            />
                        </div>
                        <div>
                            <label className="input-label">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                                <PasswordInput
                                    className="input-field has-icon"
                                    placeholder=""
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        {message && <p className={message.includes('reset') ? 'text-green-600 text-sm' : 'input-error'}>{message}</p>}
                        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                            {loading ? 'Resetting…' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            )
        }

        return (
            <div className="w-full max-w-sm mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-1">Welcome back</h1>
                    <p className="text-sm text-gray-500">Sign in to your account to continue.</p>
                </div>
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                    <div>
                        <label className="input-label">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="email"
                                className="input-field has-icon"
                                placeholder=""
                                value={loginForm.email}
                                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                required
                                autoComplete="off"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="input-label" style={{ margin: 0 }}>Password</label>
                            <button
                                type="button"
                                onClick={() => { setForgotView('email'); setError(''); setMessage('') }}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                            <PasswordInput
                                className="input-field has-icon"
                                placeholder=""
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    {error && <p className="input-error">{error}</p>}
                    {message && <p className="text-green-600 text-sm">{message}</p>}
                    <motion.button
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary btn-lg w-full shadow-sm"
                    >
                        {loading ? 'Signing in…' : <><span className="mr-2">Sign in</span> <ArrowRight className="w-4 h-4" /></>}
                    </motion.button>
                </form>
            </div>
        )
    }

    const renderSignupForm = () => {
        if (signupStep === 2) {
            return (
                <div className="w-full max-w-sm mx-auto">
                    <div className="mb-7">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                            <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Verify your email</h1>
                        <p className="text-sm text-gray-500">
                            We sent a 6-digit code to <span className="text-gray-700 font-medium">{signupForm.email}</span>
                        </p>
                    </div>
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                        <div>
                            <label className="input-label">One-Time Password</label>
                            <input
                                type="text"
                                className="input-field font-mono text-center text-2xl tracking-[0.5em]"
                                placeholder=""
                                value={signupForm.otp}
                                onChange={(e) => setSignupForm({ ...signupForm, otp: e.target.value })}
                                required
                                maxLength={6}
                                autoFocus
                                autoComplete="off"
                                style={{ height: '60px' }}
                            />
                        </div>
                        {error && <p className="input-error">{error}</p>}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setSignupStep(1); setError('') }}
                                className="btn btn-secondary flex-1"
                                style={{ height: '48px' }}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary flex-[2]"
                                style={{ height: '48px' }}
                            >
                                {loading ? 'Verifying…' : 'Verify & Sign Up'}
                            </button>
                        </div>
                    </form>
                </div>
            )
        }

        return (
            <div className="w-full max-w-sm mx-auto">
                <div className="mb-7">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-1">Create account</h1>
                    <p className="text-sm text-gray-500">Use your institute email to register.</p>
                </div>
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                    <div>
                        <label className="input-label">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                className="input-field has-icon"
                                placeholder=""
                                value={signupForm.name}
                                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                                required
                                autoComplete="off"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Institute Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="email"
                                className="input-field has-icon"
                                placeholder=""
                                value={signupForm.email}
                                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                                required
                                autoComplete="off"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                                <PasswordInput
                                    className="input-field has-icon"
                                    placeholder=""
                                    value={signupForm.password}
                                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Confirm</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                                <PasswordInput
                                    className="input-field has-icon"
                                    placeholder=""
                                    value={signupForm.confirmPassword}
                                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </div>
                    {error && <p className="input-error">{error}</p>}
                    <motion.button
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary btn-lg w-full mt-2 shadow-sm"
                    >
                        {loading ? 'Creating account…' : (
                            <><span className="mr-2">Continue</span> <ArrowRight className="w-4 h-4" /></>
                        )}
                    </motion.button>
                </form>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            {/* Desktop Container */}
            <div className="hidden md:flex relative w-full max-w-[1000px] min-h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden">

                {/* Left Half: Login */}
                <div className="w-1/2 p-12 flex flex-col justify-center relative z-0">
                    <AnimatePresence mode="wait">
                        {isLogin && (
                            <motion.div
                                key="login-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                                {renderLoginForm()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Half: Signup */}
                <div className="w-1/2 p-12 flex flex-col justify-center relative z-0">
                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div
                                key="signup-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                                {renderSignupForm()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Overlay Sliding Panel */}
                <motion.div
                    className="absolute top-0 left-1/2 w-1/2 h-full bg-[#0F0F0F] text-white z-10 flex flex-col justify-center p-12"
                    animate={{ x: isLogin ? '0%' : '-100%' }}
                    transition={{ type: 'tween', ease: 'easeInOut', duration: 0.5 }}
                >
                    <div className="flex items-center gap-2 mb-8 absolute top-12 left-12">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-sm font-semibold tracking-tight">EasyApply</span>
                    </div>

                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <motion.div
                                key="overlay-signup"
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="flex flex-col h-full justify-center"
                            >
                                <h2 className="text-4xl font-semibold leading-tight mb-4">
                                    New here?
                                </h2>
                                <p className="text-zinc-400 text-base leading-relaxed mb-8">
                                    Create your account and get instant access to placement drives, job listings, and application tracking.
                                </p>
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={() => setIsLogin(false)}
                                    className="px-8 py-3 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition-colors w-fit font-medium text-sm"
                                >
                                    Sign Up
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="overlay-login"
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="flex flex-col h-full justify-center"
                            >
                                <h2 className="text-4xl font-semibold leading-tight mb-4">
                                    Welcome back!
                                </h2>
                                <p className="text-zinc-400 text-base leading-relaxed mb-8">
                                    To keep connected with us please login with your personal info.
                                </p>
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={() => setIsLogin(true)}
                                    className="px-8 py-3 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition-colors w-fit font-medium text-sm"
                                >
                                    Sign In
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Mobile Container Stacked */}
            <div className="md:hidden w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 relative">
                <div className="flex items-center gap-2 mb-8 justify-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-sm font-semibold tracking-tight text-gray-900">EasyApply</span>
                </div>

                <AnimatePresence mode="wait">
                    {isLogin ? (
                        <motion.div
                            key="mobile-login"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderLoginForm()}
                            <p className="text-sm text-gray-500 text-center mt-6">
                                No account?{' '}
                                <button onClick={() => setIsLogin(false)} className="text-indigo-600 hover:text-indigo-700 font-medium">
                                    Sign up
                                </button>
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="mobile-signup"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderSignupForm()}
                            <p className="text-sm text-gray-500 text-center mt-6">
                                Already have an account?{' '}
                                <button onClick={() => setIsLogin(true)} className="text-indigo-600 hover:text-indigo-700 font-medium">
                                    Sign in
                                </button>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
