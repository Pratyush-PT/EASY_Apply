"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to applications page as default dashboard
    router.replace("/admin/applications");
  }, [router]);

  return (
    <div className="p-6 text-white">
      <p>Redirecting...</p>
    </div>
  );
}
