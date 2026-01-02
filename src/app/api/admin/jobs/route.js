import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import Application from "@/models/Application";
import Interest from "@/models/Interest";

async function getAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    await connectDB();
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
  
  // Get counts for each job
  const jobsWithCounts = await Promise.all(
    jobs.map(async (job) => {
      const [appliedCount, interestedCount] = await Promise.all([
        Application.countDocuments({ jobId: job._id }),
        Interest.countDocuments({ jobId: job._id }),
      ]);

      // Count interested but not applied
      const allInterests = await Interest.find({ jobId: job._id }).select("studentId");
      const allApplications = await Application.find({ jobId: job._id }).select("studentId");
      const appliedStudentIds = new Set(allApplications.map(app => app.studentId.toString()));
      const interestedNotApplied = allInterests.filter(
        interest => !appliedStudentIds.has(interest.studentId.toString())
      ).length;

      return {
        ...job.toObject(),
        appliedCount,
        interestedCount,
        interestedNotApplied,
      };
    })
  );

  return Response.json({ jobs: jobsWithCounts });
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
