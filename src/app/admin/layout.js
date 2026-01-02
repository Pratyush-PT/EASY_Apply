import AdminNavbar from "@/components/adminNavbar";

export default function AdminLayout({ children }) {
  return (
    <>
      <AdminNavbar />
      <main>{children}</main>
    </>
  );
}
