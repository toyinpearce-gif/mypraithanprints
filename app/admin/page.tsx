import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "../../lib/auth";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
  if (!isAdminAuthenticated()) {
    redirect("/login");
  }

  return <AdminDashboard />;
}
