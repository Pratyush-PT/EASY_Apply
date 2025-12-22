"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch("/api/admin/jobs")
      .then(res => res.json())
      .then(data => setJobs(data.jobs || []));
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4">Jobs</h1>

      <Link href="/admin/jobs/create" className="text-blue-400">
        + Create Job
      </Link>

      <ul className="mt-4">
        {jobs.map(job => (
          <li key={job._id} className="border-b py-2">
            {job.company} — {job.role}
          </li>
        ))}
      </ul>
    </div>
  );
}
