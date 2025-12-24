import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/dbConnect";
import Application from "@/models/Application";
import Job from "@/models/Job";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();

    // Admin auth
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    //  job filter
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    const query = jobId ? { jobId } : {};

    const applications = await Application.find(query)
      .populate("jobId", "role company")
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    // CSV Header
    let csv =
      "Name,Email,Company,Role,Branch,CGPA,Status,Applied At\n";

    applications.forEach((app) => {
      csv += `"${app.name || app.studentId?.name || ""}",`;
      csv += `"${app.email || app.studentId?.email || ""}",`;
      csv += `"${app.jobId?.company || ""}",`;
      csv += `"${app.jobId?.role || ""}",`;
      csv += `"${app.branch || ""}",`;
      csv += `"${app.cgpa || ""}",`;
      csv += `"${app.status}",`;
      csv += `"${app.createdAt.toISOString()}"\n`;
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition":
          'attachment; filename="applications.csv"',
      },
    });
  } catch (error) {
    console.error("CSV EXPORT ERROR 👉", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
