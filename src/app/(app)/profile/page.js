"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";
import {
  User, Mail, Phone, BookOpen, BarChart2, FileText,
  Pencil, X, Check, Trash2, ExternalLink, Plus, AlertCircle,
} from "lucide-react";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2.5 text-sm text-gray-500">
        <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        {label}
      </div>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[55%] truncate">
        {value || <span className="text-gray-400 font-normal">Not set</span>}
      </span>
    </div>
  );
}

function Avatar({ name }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
      <span className="text-white font-semibold text-sm">{initials}</span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [resumeName, setResumeName] = useState("Resume");
  const [resumeLink, setResumeLink] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState({ name: "", email: "", branch: "", cgpa: "", contact: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [deletingResume, setDeletingResume] = useState(null);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [resumeMsg, setResumeMsg] = useState({ type: "", text: "" });
  const [showAddResume, setShowAddResume] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) { router.replace("/login"); return; }
        const data = await res.json();
        setUser(data.user);
        setEditingUser({ name: data.user.name || "", email: data.user.email || "", branch: data.user.branch || "", cgpa: data.user.cgpa || "", contact: data.user.contact || "", password: "" });
        setLoading(false);
      } catch { router.replace("/login"); }
    };
    fetchProfile();
    fetchResumes();
  }, [router]);

  const fetchResumes = async () => {
    try {
      const res = await fetch("/api/profile/resume");
      if (res.ok) { const d = await res.json(); setResumes(d.resumes || []); }
    } catch { }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeLink) { setResumeMsg({ type: "error", text: "Please enter a resume link." }); return; }
    setUploading(true);
    setResumeMsg({ type: "", text: "" });
    try {
      const res = await fetch("/api/profile/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: resumeName, url: resumeLink }),
      });
      const data = await res.json();
      if (res.ok) {
        setResumeMsg({ type: "success", text: "Resume added." });
        setResumeName("Resume"); setResumeLink(""); setShowAddResume(false);
        await fetchResumes();
      } else {
        setResumeMsg({ type: "error", text: data.error || "Failed to add resume." });
      }
    } catch { setResumeMsg({ type: "error", text: "Something went wrong." }); }
    finally { setUploading(false); }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setProfileMsg({ type: "", text: "" });
    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });
      const data = await res.json();
      if (res.ok) {
        const profileRes = await fetch("/api/me");
        if (profileRes.ok) { const pd = await profileRes.json(); setUser(pd.user); }
        setIsEditing(false);
        setProfileMsg({ type: "success", text: "Profile updated." });
      } else {
        setProfileMsg({ type: "error", text: data.error || "Failed to update profile." });
      }
    } catch { setProfileMsg({ type: "error", text: "Something went wrong." }); }
    finally { setSaving(false); }
  };

  const handleDeleteResume = async (resumeUrl) => {
    setDeletingResume(resumeUrl);
    try {
      const res = await fetch(`/api/profile/resume?url=${encodeURIComponent(resumeUrl)}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) { setResumeMsg({ type: "success", text: "Resume deleted." }); await fetchResumes(); }
      else { setResumeMsg({ type: "error", text: data.error || "Failed to delete." }); }
    } catch { setResumeMsg({ type: "error", text: "Something went wrong." }); }
    finally { setDeletingResume(null); }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingUser({ name: user.name || "", email: user.email || "", branch: user.branch || "", cgpa: user.cgpa || "", contact: user.contact || "", password: "" });
    setProfileMsg({ type: "", text: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const BRANCHES = ["CSE", "ECE", "EIE", "EE", "ME", "CE"];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 max-w-5xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your personal information and resumes.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left: Personal Info */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Avatar name={user?.name} />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary btn-sm"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>

          {profileMsg.text && (
            <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-lg ${profileMsg.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-600'
              }`}>
              {profileMsg.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {profileMsg.text}
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              {[
                { label: "Full Name", key: "name", type: "text", placeholder: "John Doe" },
                { label: "Email", key: "email", type: "email", placeholder: "you@nits.ac.in" },
                { label: "CGPA", key: "cgpa", type: "number", placeholder: "8.5" },
                { label: "Phone Number", key: "contact", type: "tel", placeholder: "+91 XXXXX XXXXX" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="input-label">{label}</label>
                  <input
                    type={type}
                    step={key === "cgpa" ? "0.01" : undefined}
                    value={editingUser[key]}
                    onChange={(e) => setEditingUser({ ...editingUser, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="input-field"
                  />
                </div>
              ))}

              <div>
                <label className="input-label">Branch</label>
                <select
                  value={editingUser.branch}
                  onChange={(e) => setEditingUser({ ...editingUser, branch: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select branch</option>
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="input-label">New Password <span className="normal-case font-normal">(leave blank to keep current)</span></label>
                <PasswordInput
                  className="input-field"
                  placeholder="New password"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveProfile} disabled={saving} className="btn btn-primary flex-1">
                  <Check className="w-4 h-4" />
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button onClick={handleCancelEdit} disabled={saving} className="btn btn-secondary">
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <InfoRow icon={User} label="Name" value={user?.name} />
              <InfoRow icon={Mail} label="Email" value={user?.email} />
              <InfoRow icon={BookOpen} label="Branch" value={user?.branch} />
              <InfoRow icon={BarChart2} label="CGPA" value={user?.cgpa} />
              <InfoRow icon={Phone} label="Phone" value={user?.contact} />
            </div>
          )}
        </div>

        {/* Right: Resumes */}
        <div className="card h-fit">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900 text-base">Resumes</h2>
            <button
              onClick={() => { setShowAddResume(!showAddResume); setResumeMsg({ type: "", text: "" }); }}
              className="btn btn-secondary btn-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          {resumeMsg.text && (
            <div className={`flex items-center gap-2 text-sm mb-4 p-3 rounded-lg ${resumeMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}>
              {resumeMsg.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {resumeMsg.text}
            </div>
          )}

          {showAddResume && (
            <form onSubmit={handleResumeUpload} className="space-y-3 mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <label className="input-label">Resume Name</label>
                <input
                  type="text"
                  value={resumeName}
                  onChange={(e) => setResumeName(e.target.value)}
                  placeholder="e.g. SDE Resume"
                  className="input-field"
                  style={{ height: '40px', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label className="input-label">Drive Link</label>
                <input
                  type="url"
                  value={resumeLink}
                  onChange={(e) => setResumeLink(e.target.value)}
                  placeholder="https://drive.google.com/…"
                  className="input-field"
                  style={{ height: '40px', fontSize: '0.875rem' }}
                  required
                />
              </div>
              <button type="submit" disabled={uploading} className="btn btn-primary w-full btn-sm">
                {uploading ? "Adding…" : "Add Resume"}
              </button>
            </form>
          )}

          {resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">No resumes added yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {resumes.map((resume, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{resume.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <a
                      href={resume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                      title="View resume"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteResume(resume.url)}
                      disabled={deletingResume === resume.url}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-40"
                      title="Delete resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
