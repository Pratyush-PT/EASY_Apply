"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function EditJob({ params }) {
    const router = useRouter();
    // Unwrap params using React.use()
    const { jobId } = use(params);

    const [form, setForm] = useState({
        company: "",
        role: "",
        description: "",
        eligibleBranches: "",
        minCgpa: "",
        deadline: "",
        jdPdfUrl: null,
    });
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await fetch(`/api/admin/jobs/${jobId}`);
                if (!res.ok) throw new Error("Failed to fetch job");
                const data = await res.json();
                const job = data.job;

                setForm({
                    company: job.company || "",
                    role: job.role || "",
                    description: job.description || "",
                    eligibleBranches: job.eligibleBranches ? job.eligibleBranches.join(", ") : "",
                    minCgpa: job.minCgpa || "",
                    deadline: job.deadline ? new Date(job.deadline).toISOString().split("T")[0] : "",
                    jdPdfUrl: job.jdPdfUrl || null,
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchJob();
        }
    }, [jobId]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setUploading(true);

        try {
            let jdPdfUrl = form.jdPdfUrl; // Use URL from form link

            // Update job
            const payload = {
                company: form.company.trim(),
                role: form.role.trim(),
                description: form.description.trim(),
                eligibleBranches: form.eligibleBranches
                    .split(",")
                    .map((b) => b.trim())
                    .filter((b) => b.length > 0),
                minCgpa: form.minCgpa ? Number(form.minCgpa) : undefined,
                deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
                jdPdfUrl,
            };

            // Validate required fields
            if (!payload.company || !payload.role || !payload.eligibleBranches.length) {
                setError("Company, Role, and Eligible Branches are required");
                setUploading(false);
                return;
            }

            const res = await fetch(`/api/admin/jobs/${jobId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Job updated successfully!");
                router.push("/admin/jobs");
            } else {
                setError(data.message || "Failed to update job");
            }
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <p className="p-6 text-white">Loading job details...</p>;

    return (
        <div className="p-6 max-w-3xl mx-auto text-white">
            <h1 className="text-2xl font-bold mb-6">Edit Job</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-lg p-6 space-y-6">
                {/* Company Name Section */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Company Name <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder="Enter company name"
                        className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>

                {/* Role Section */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Role <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        placeholder="Enter job role (e.g., SDE Intern, Software Engineer)"
                        className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>

                {/* Description Section */}
                <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Enter job description"
                        rows={5}
                        className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-blue-500 resize-none"
                    />
                </div>

                {/* Job Description File Upload Section */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Job Description Drive Link
                    </label>
                    {form.jdPdfUrl && (
                        <p className="mb-2 text-sm text-blue-400">
                            Current Link: <a href={form.jdPdfUrl} target="_blank" className="underline">View PDF</a>
                        </p>
                    )}
                    <input
                        type="url"
                        value={form.jdPdfUrl}
                        onChange={(e) => setForm({ ...form, jdPdfUrl: e.target.value })}
                        placeholder="https://drive.google.com/..."
                        className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* Eligible Branches Section */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Eligible Branches <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.eligibleBranches}
                        onChange={(e) => setForm({ ...form, eligibleBranches: e.target.value })}
                        placeholder="Enter branches separated by commas (e.g., CSE, IT, ECE)"
                        className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-blue-500"
                        required
                    />
                    <p className="mt-1 text-xs text-zinc-400">
                        Separate multiple branches with commas
                    </p>
                </div>

                {/* Min CGPA Section */}
                <div>
                    <label className="block text-sm font-medium mb-2">Minimum CGPA Required</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={form.minCgpa}
                        onChange={(e) => setForm({ ...form, minCgpa: e.target.value })}
                        placeholder="Enter minimum CGPA (e.g., 7.5)"
                        className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* Deadline Section */}
                <div>
                    <label className="block text-sm font-medium mb-2">Application Deadline</label>
                    <input
                        type="date"
                        value={form.deadline}
                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={uploading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded font-semibold transition"
                    >
                        {uploading ? "Updating..." : "Update Job"}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push("/admin/jobs")}
                        disabled={uploading}
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded font-semibold transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
