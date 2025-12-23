import { connectDB } from "@/lib/dbConnect";
import Application from "@/models/Application";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const auth = req.headers.get("authorization");
    if (!auth) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await User.findById(decoded.id);
    if (!admin || admin.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const applications = await Application.find({
      jobId: params.jobId,
    }).sort({ createdAt: -1 });

    return Response.json({ applications }, { status: 200 });
  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
