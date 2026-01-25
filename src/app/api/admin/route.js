import { connectDB } from '@/lib/dbConnect'
import Job from '@/models/Job'
import jwt from 'jsonwebtoken'
import User from '@/models/User'

async function getAdmin(req) {
    const token = req.cookies.get('token')?.value
    if (!token) return null

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id)
        if (user?.role === 'admin') return user
        return null
    } catch {
        return null
    }
}

// CREATE JOB
export async function POST(req) {
    try {
        await connectDB()

        const admin = await getAdmin(req)
        if (!admin) {
            return Response.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()

        const { company, role, description, eligibleBranches, minCgpa, deadline } =
            body

        if (!company || !role || !eligibleBranches?.length) {
            return Response.json(
                { message: 'Missing required fields' },
                { status: 400 },
            )
        }

        const job = await Job.create({
            company,
            role,
            description,
            eligibleBranches,
            minCgpa,
            deadline,
            postedBy: admin._id,
        })

        return Response.json(
            { message: 'Job created successfully', job },
            { status: 201 },
        )
    } catch (err) {
        console.error(err)
        return Response.json({ message: 'Internal server error' }, { status: 500 })
    }
}

// LIST JOBS (ADMIN VIEW)
export async function GET(req) {
    try {
        await connectDB()

        const admin = await getAdmin(req)
        if (!admin) {
            return Response.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const jobs = await Job.find().sort({ createdAt: -1 })

        return Response.json({ jobs })
    } catch {
        return Response.json({ message: 'Internal server error' }, { status: 500 })
    }
}
