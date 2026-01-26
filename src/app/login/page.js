'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PasswordInput from '@/components/PasswordInput'

export default function Login() {
    const router = useRouter()
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)

    // Forgot Password State
    const [view, setView] = useState('login') // 'login', 'forgot-email', 'forgot-otp'
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotOtp, setForgotOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })

            const data = await res.json()

            if (res.ok) {
                // Redirect based on user role
                const role = data.role?.toLowerCase()
                if (role === 'admin') {
                    console.log('here')
                    router.replace('/admin')
                } else {
                    router.replace('/profile')
                }
            } else {
                alert(data.error || 'Login failed')
            }
        } catch (error) {
            console.error('Login Error:', error)
            alert('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

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
                setView('forgot-otp')
                setMessage('OTP sent to your email')
            } else {
                alert(data.error || 'Failed to send OTP')
            }
        } catch (error) {
            console.error('Forgot Password Error:', error)
            alert('Something went wrong. Please try again.')
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
                alert('Password reset successfully! Please login with your new password.')
                setView('login')
                setForm({ email: forgotEmail, password: '' })
            } else {
                alert(data.error || 'Failed to reset password')
            }
        } catch (error) {
            console.error('Reset Password Error:', error)
            alert('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-black relative overflow-hidden'>
            {/* Background Gradient Blob */}
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none' />

            <div className='glass p-6 md:p-8 rounded-2xl shadow-2xl w-[90%] md:w-full max-w-md relative z-10 border border-white/10'>
                {view === 'login' && (
                    <>
                        <h1 className='text-3xl font-bold mb-8 text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent'>
                            Welcome Back
                        </h1>

                        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
                            <div className='space-y-1'>
                                <label className='text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1'>
                                    Email
                                </label>
                                <input
                                    type='email'
                                    className='w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium'
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className='space-y-1'>
                                <label className='text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1'>
                                    Password
                                </label>
                                <PasswordInput
                                    className='w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium'
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                                <div className='flex justify-end'>
                                    <button
                                        type='button'
                                        onClick={() => setView('forgot-email')}
                                        className='text-xs text-blue-400 hover:text-blue-300 transition-colors mt-1'
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            </div>

                            <button
                                type='submit'
                                disabled={loading}
                                className='mt-4 w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>

                            <div className='text-center mt-6 text-sm text-gray-400'>
                                {"Don't have an account?"}
                                <Link
                                    href='/signup'
                                    className='text-white hover:text-blue-400 underline decoration-blue-500/30 underline-offset-4 transition-colors'
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </form>
                    </>
                )}

                {view === 'forgot-email' && (
                    <>
                        <h1 className='text-2xl font-bold mb-6 text-center text-white'>
                            Reset Password
                        </h1>
                        <p className='text-gray-400 text-sm mb-6 text-center'>
                            Enter your email to receive a One-Time Password (OTP).
                        </p>
                        <form onSubmit={handleForgotEmailSubmit} className='flex flex-col gap-5'>
                            <div className='space-y-1'>
                                <label className='text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1'>
                                    Email
                                </label>
                                <input
                                    type='email'
                                    className='w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium'
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type='submit'
                                disabled={loading}
                                className='mt-4 w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>

                            <div className='text-center mt-4'>
                                <button
                                    type='button'
                                    onClick={() => setView('login')}
                                    className='text-sm text-gray-400 hover:text-white transition-colors'
                                >
                                    Back to Login
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {view === 'forgot-otp' && (
                    <>
                        <h1 className='text-2xl font-bold mb-6 text-center text-white'>
                            Enter OTP
                        </h1>
                        {message && <p className='text-green-400 text-sm mb-4 text-center'>{message}</p>}
                        <form onSubmit={handleResetPasswordSubmit} className='flex flex-col gap-5'>
                            <div className='space-y-1'>
                                <label className='text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1'>
                                    Email
                                </label>
                                <input
                                    type='email'
                                    className='w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white/50 placeholder-gray-500 cursor-not-allowed'
                                    value={forgotEmail}
                                    readOnly
                                />
                            </div>

                            <div className='space-y-1'>
                                <label className='text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1'>
                                    OTP
                                </label>
                                <input
                                    type='text'
                                    className='w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium'
                                    value={forgotOtp}
                                    onChange={(e) => setForgotOtp(e.target.value)}
                                    placeholder="Enter 6-digit OTP"
                                    required
                                />
                            </div>

                            <div className='space-y-1'>
                                <label className='text-xs uppercase tracking-wider text-gray-400 font-semibold ml-1'>
                                    New Password
                                </label>
                                <PasswordInput
                                    className='w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium'
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type='submit'
                                disabled={loading}
                                className='mt-4 w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </button>

                            <div className='text-center mt-4'>
                                <button
                                    type='button'
                                    onClick={() => setView('login')}
                                    className='text-sm text-gray-400 hover:text-white transition-colors'
                                >
                                    Back to Login
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}
