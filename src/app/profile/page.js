"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // If no token → redirect to login
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch logged-in user data
    fetch("/api/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // 🔥 IMPORTANT FIX IS HERE
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        router.push("/login");
      });
  }, [router]);

  if (loading) {
    return <p className="p-6">Loading profile...</p>;
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

      <p className="mb-2">
        <strong>Name:</strong> {user?.name}
      </p>

      <p className="mb-4">
        <strong>Email:</strong> {user?.email}
      </p>

      <button
        className="bg-red-600 text-white px-4 py-2 rounded"
        onClick={() => {
          localStorage.removeItem("token");
          document.cookie = "token=; Max-Age=0; path=/";
          router.push("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
}
