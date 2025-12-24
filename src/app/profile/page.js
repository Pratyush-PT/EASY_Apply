"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/me");

        if (!res.ok) {
          // ❌ Not authenticated
          router.replace("/login");
          return;
        }

        const data = await res.json();
        setUser(data.user);
        setLoading(false);
      } catch (err) {
        router.replace("/login");
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return <p className="p-6 text-white">Loading profile...</p>;
  }

  return (
    <div className="p-6 max-w-md mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

      <p className="mb-2">
        <strong>Name:</strong> {user.name}
      </p>

      <p className="mb-2">
        <strong>Email:</strong> {user.email}
      </p>

      <p className="mb-2">
        <strong>Branch:</strong> {user.branch}
      </p>

      <p className="mb-4">
        <strong>CGPA:</strong> {user.cgpa}
      </p>

      <button
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.replace("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
}
