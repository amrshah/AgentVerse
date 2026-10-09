import { getAdminDashboardStats } from "@/actions/admin";
import SaaSAdminDashboard from "@/components/app/saas-admin-dashboard";
import Header from "@/components/app/header";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <SaaSAdminDashboard initialStats={stats} />
      </main>
    </div>
  );
}
