import { connectDB } from "@/lib/db";
import Job from "@/models/Job";

export async function GET() {
  try {
    await connectDB();
    const jobs = await Job.find().sort({ createdAt: -1 });
    return Response.json(jobs);
  } catch (err) {
    return Response.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
