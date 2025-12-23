import { connectDB } from "@/lib/db";
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

// GET ONE JOB
export async function GET(req, { params }) {
  await connectDB();

  const admin = await getAdmin(req);
  if (!admin) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const job = await Job.findById(params.jobId);
  if (!job) {
    return Response.json({ message: "Job not found" }, { status: 404 });
  }

  return Response.json({ job });
}

// UPDATE JOB
export async function PUT(req, { params }) {
  await connectDB();

  const admin = await getAdmin(req);
  if (!admin) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const job = await Job.findByIdAndUpdate(params.jobId, body, { new: true });

  return Response.json({ message: "Job updated", job });
}

// DELETE JOB
export async function DELETE(req, { params }) {
  await connectDB();

  const admin = await getAdmin(req);
  if (!admin) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  await Job.findByIdAndDelete(params.jobId);
  return Response.json({ message: "Job deleted" });
}
