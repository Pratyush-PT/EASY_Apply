import { connectDB } from "@/lib/db";
import Job from "@/models/Job";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();

    const auth = req.headers.get("authorization");
    if (!auth) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];

    if (!token) {
  return Response.json({ error: "Invalid token format" }, { status: 401 });
}

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //  console.log(decoded);
    const admin = await User.findById(decoded.id);
    if (!admin || admin.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      company,
      role,
      description,
      jdPdfUrl,
      eligibleBranches,
      deadline,
    } = await req.json();

    if (!company || !role || !eligibleBranches?.length) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const job = await Job.create({
      company,
      role,
      description,
      jdPdfUrl,
      eligibleBranches,
      deadline,
      postedBy: admin._id,
    });
     console.log("Job created successfully")
    return Response.json({ job }, { status: 201 });
  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
