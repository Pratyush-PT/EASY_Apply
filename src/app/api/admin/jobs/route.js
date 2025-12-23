import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";
import jwt from "jsonwebtoken";
import User from "@/models/User";

async function getAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    return user?.role === "admin" ? user : null;
  } catch {
    return null;
  }
}

// ✅ LIST JOBS (NO params here)
export async function GET(req) {
  await connectDB();

  const admin = await getAdmin(req);
  if (!admin) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const jobs = await Job.find().sort({ createdAt: -1 });
  return Response.json({ jobs });
}

// ✅ CREATE JOB
export async function POST(req) {
  await connectDB();

  const admin = await getAdmin(req);
  if (!admin) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const job = await Job.create({
    ...body,
    postedBy: admin._id,
  });

  return Response.json(
    { message: "Job created successfully", job },
    { status: 201 }
  );
}
