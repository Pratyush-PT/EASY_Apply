import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/dbConnect'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendEmail } from '@/lib/sendEmail'

export async function POST(req) {
    try {
        await connectDB()

        const { email, password } = await req.json()

        // 1. Check for Hardcoded Admin via Env Vars (Recovery/Master Access)
        const isAdminEnv =
            process.env.ADMIN_EMAIL &&
            email === process.env.ADMIN_EMAIL &&
            process.env.ADMIN_PASSWORD &&
            password === process.env.ADMIN_PASSWORD

        let user = await User.findOne({ email })
        let isMatch = false

        if (isAdminEnv) {
            // If checking against env vars, we force success
            isMatch = true

            // If user doesn't exist, create them as admin
            if (!user) {
                user = await User.create({
                    name: 'Admin',
                    email,
                    password: await bcrypt.hash(password, 10),
                    role: 'admin',
                    cgpa: 0,
                    branch: 'N/A',
                })
            }
            // If user exists but isn't admin, fix it
            else if (user.role !== 'admin') {
                user.role = 'admin'
                await user.save()
            }
        } else {
            // 2. Standard Database Login
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 400 })
            }
            isMatch = await bcrypt.compare(password, user.password)
        }

        if (!isMatch) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 },
            )
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
        )

        const res = NextResponse.json({
            success: true,
            role: user.role,
            message: 'Login successful',
        })

        res.cookies.set('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7,
        })

        return res
    } catch (err) {
        console.error('Login Error:', err)
        return NextResponse.json(
            { error: err.message || 'Login failed' },
            { status: 500 },
        )
    }
}
