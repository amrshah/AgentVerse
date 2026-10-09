import { getAdminDashboardStats } from "@/actions/admin";
import SaaSAdminDashboard from "@/components/app/saas-admin-dashboard";
import Header from "@/components/app/header";
import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getCurrentSession();

  // If unauthenticated, redirect to login with callback
  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  // If not super admin, show access denied
  if (session.user.role !== "admin") {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 border rounded-xl bg-card text-center space-y-4 shadow-lg">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Access Denied (403)</h2>
            <p className="text-sm text-muted-foreground">
              You are signed in as <span className="font-medium text-foreground">{session.user.email}</span> with role <span className="font-semibold text-primary">{session.user.role}</span>. Super Admin privileges are required to access the Platform Control Center.
            </p>
            <div className="pt-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/" className="flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Return to Studio
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
