import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";

export async function GET() {
  try {
    await connectDB();
    const jobs = await Job.find().sort({ createdAt: -1 });
    return Response.json(jobs);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
