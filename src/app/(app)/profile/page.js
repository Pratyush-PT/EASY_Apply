"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [resumeName, setResumeName] = useState("Resume");
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState({
    name: "",
    email: "",
    branch: "",
    cgpa: "",
    contact: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [deletingResume, setDeletingResume] = useState(null);

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
        setEditingUser({
          name: data.user.name || "",
          email: data.user.email || "",
          branch: data.user.branch || "",
          cgpa: data.user.cgpa || "",
          contact: data.user.contact || "",
          password: "",
        });
        setLoading(false);
      } catch (err) {
        router.replace("/login");
      }
    };

    fetchProfile();
    fetchResumes();
  }, [router]);

  const fetchResumes = async () => {
    try {
      const res = await fetch("/api/profile/resume");
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes || []);
      }
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    const fileInput = e.target.resume;
    const file = fileInput.files[0];

    if (!file) {
      alert("Please select a file");
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("name", resumeName);

      const res = await fetch("/api/profile/resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Resume uploaded successfully!");
        setResumeName("Resume");
        fileInput.value = "";
        await fetchResumes();
      } else {
        alert(data.error || "Failed to upload resume");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Something went wrong while uploading");
    } finally {
      setUploading(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setEditingUser({
      name: user.name || "",
      email: user.email || "",
      branch: user.branch || "",
      cgpa: user.cgpa || "",
      contact: user.contact || "",
      password: "",
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingUser({
      name: user.name || "",
      email: user.email || "",
      branch: user.branch || "",
      cgpa: user.cgpa || "",
      contact: user.contact || "",
      password: "",
    });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });

      const data = await res.json();

      if (res.ok) {
        setUser({ ...user, ...data.user });
        setIsEditing(false);
        alert("Profile updated successfully!");
        // Refresh profile data
        const profileRes = await fetch("/api/me");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData.user);
        }
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Something went wrong while updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResume = async (resumeUrl) => {
    if (!confirm("Are you sure you want to delete this resume?")) {
      return;
    }

    setDeletingResume(resumeUrl);
    try {
      const res = await fetch(`/api/profile/resume?url=${encodeURIComponent(resumeUrl)}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        alert("Resume deleted successfully!");
        await fetchResumes();
      } else {
        alert(data.error || "Failed to delete resume");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong while deleting resume");
    } finally {
      setDeletingResume(null);
    }
  };

  if (loading) {
    return <p className="p-6 text-white">Loading profile...</p>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

      <div className="bg-zinc-900 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          {!isEditing && (
            <button
              onClick={handleEditProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold"
            >
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={editingUser.name}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Branch</label>
              <select
                value={editingUser.branch}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, branch: e.target.value })
                }
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white"
                required
              >
                <option value="">Select Branch</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EIE">EIE</option>
                <option value="EE">EE</option>
                <option value="ME">ME</option>
                <option value="CE">CE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">CGPA</label>
              <input
                type="number"
                step="0.01"
                value={editingUser.cgpa}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, cgpa: e.target.value })
                }
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={editingUser.contact}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, contact: e.target.value })
                }
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                New Password (leave blank to keep current)
              </label>
              <input
                type="password"
                value={editingUser.password}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, password: e.target.value })
                }
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white"
                placeholder="Enter new password"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-semibold"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-2">
              <strong>Name:</strong> {user.name}
            </p>

            <p className="mb-2">
              <strong>Email:</strong> {user.email}
            </p>

            <p className="mb-2">
              <strong>Branch:</strong> {user.branch}
            </p>

            <p className="mb-2">
              <strong>CGPA:</strong> {user.cgpa}
            </p>

            <p className="mb-4">
              <strong>Phone Number:</strong> {user.contact || "Not provided"}
            </p>
          </div>
        )}
      </div>

      <div className="bg-zinc-900 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Resume</h2>
        
        <form onSubmit={handleResumeUpload} className="mb-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Resume Name (optional)
            </label>
            <input
              type="text"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              placeholder="e.g., SDE Resume, Core Resume"
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Upload PDF Resume (Max 5MB)
            </label>
            <input
              type="file"
              name="resume"
              accept=".pdf"
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
              required
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-semibold"
          >
            {uploading ? "Uploading..." : "Upload Resume"}
          </button>
        </form>

        {resumes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Your Resumes</h3>
            <div className="space-y-3">
              {resumes.map((resume, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-zinc-800 rounded border border-zinc-700"
                >
                  <div className="flex-1">
                    <p className="font-medium">{resume.name}</p>
                    <p className="text-sm text-gray-400 truncate">{resume.url}</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={resume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDeleteResume(resume.url)}
                      disabled={deletingResume === resume.url}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm"
                    >
                      {deletingResume === resume.url ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

