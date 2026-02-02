'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PasswordInput from '@/components/PasswordInput'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock } from 'lucide-react'

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
                const role = data.role?.toLowerCase()
                router.replace(role === 'admin' ? '/admin' : '/profile')
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
                body: JSON.stringify({
                    email: forgotEmail,
                    otp: forgotOtp,
                    newPassword,
                }),
            })

            const data = await res.json()

            if (res.ok) {
                alert(
                    'Password reset successfully! Please login with your new password.',
                )
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
        <div className='min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden'>

            {/* Center Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='bg-white p-6 md:p-8 rounded-2xl shadow-lg w-[90%] md:w-full max-w-md relative z-10 border border-gray-200'
            >
                {/* LOGIN */}
                {view === 'login' && (
                    <>
                        <h1 className='text-3xl font-bold mb-8 text-center text-slate-800'>
                            Welcome Back
                        </h1>

                        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
                            <div>
                                <label className='text-xs uppercase tracking-wider text-gray-600 font-semibold'>
                                    Email
                                </label>
                                <input
                                    type='email'
                                    className='w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-slate-800'
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className='text-xs uppercase tracking-wider text-gray-600 font-semibold'>
                                    Password
                                </label>
                                <PasswordInput
                                    className='w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-slate-800'
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm({ ...form, password: e.target.value })
                                    }
                                    required
                                />

                                <div className='flex justify-end'>
                                    <button
                                        type='button'
                                        onClick={() => setView('forgot-email')}
                                        className='text-xs text-indigo-600 mt-1'
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            </div>

                            <button
                                type='submit'
                                disabled={loading}
                                className='w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700'
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                    </>
                )}

                {/* FORGOT EMAIL */}
                {view === 'forgot-email' && (
                    <>
                        <h1 className='text-2xl font-bold mb-6 text-center text-slate-800'>
                            Reset Password
                        </h1>

                        <form
                            onSubmit={handleForgotEmailSubmit}
                            className='flex flex-col gap-5'
                        >
                            <input
                                type='email'
                                className='w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-slate-800'
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                required
                            />

                            <button
                                type='submit'
                                disabled={loading}
                                className='bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700'
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>

                            <button
                                type='button'
                                onClick={() => setView('login')}
                                className='text-sm text-gray-600'
                            >
                                Back to Login
                            </button>
                        </form>
                    </>
                )}

                {/* OTP + RESET */}
                {view === 'forgot-otp' && (
                    <>
                        <h1 className='text-2xl font-bold mb-6 text-center text-slate-800'>
                            Enter OTP
                        </h1>

                        <form
                            onSubmit={handleResetPasswordSubmit}
                            className='flex flex-col gap-5'
                        >
                            <input
                                type='text'
                                className='w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-slate-800'
                                value={forgotOtp}
                                onChange={(e) => setForgotOtp(e.target.value)}
                                placeholder='Enter OTP'
                                required
                            />

                            <PasswordInput
                                className='w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-slate-800'
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />

                            <button
                                type='submit'
                                disabled={loading}
                                className='bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700'
                            >
                                Reset Password
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    )
}
