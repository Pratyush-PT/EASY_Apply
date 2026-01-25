import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.cookies.get('token')?.value

    /* =====================================================
                 1️⃣ AUTH PAGES — redirect logged-in users away
              ====================================================== */
    if (token && (pathname === '/login' || pathname === '/signup')) {
        return NextResponse.redirect(new URL('/profile', req.url))
    }

    /* =====================================================
                 2️⃣ PROTECTED PAGES — require login
              ====================================================== */
    const protectedRoutes = ['/profile', '/my-applications', '/admin']

    const isProtectedPage = protectedRoutes.some((route) =>
        pathname.startsWith(route),
    )

    if (!token && isProtectedPage) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    /* =====================================================
                 3️⃣ ADMIN API PROTECTION (your original logic)
              ====================================================== */
    if (pathname.startsWith('/api/admin')) {
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET)
            const { payload } = await jwtVerify(token, secret)
            const role = payload.role?.toLowerCase()

            if (role !== 'admin') {
                return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
            }
        } catch (error) {
            console.error('Middleware Auth Error:', error)
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/login',
        '/signup',
        '/profile',
        '/my-applications',
        '/admin/:path*',
        '/api/admin/:path*',
    ],
}
