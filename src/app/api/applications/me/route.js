import { connectDB } from "@/lib/db";
import Application from "@/models/Application";
import User from "@/models/User";
import jwt from "jsonwebtoken";

async function getUserFromRequest(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id);
  } catch {
    return null;
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const user = await getUserFromRequest(req);
    if (!user) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const applications = await Application.find({
      studentId: user._id,
    }).select("jobId");

    return Response.json(applications);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
