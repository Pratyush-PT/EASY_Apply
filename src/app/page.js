"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // User not logged in → Signup
      router.replace("/signup");
    } else {
      // User logged in → Jobs dashboard
      router.replace("/jobs");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Redirecting...</p>
    </div>
  );
}
