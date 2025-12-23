export default function AdminPage() {
  return (
    <div className="min-h-screen p-8 bg-black text-white">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <ul className="mt-6 space-y-3">
        <li>📌 Manage Jobs</li>
        <li>📌 View Applications</li>
        <li>📌 Create New Job</li>
      </ul>
    </div>
  );
}
