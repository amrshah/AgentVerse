import ClientProfilesDashboard from "@/components/app/client-profiles-dashboard";
import Header from "@/components/app/header";
import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login?callbackUrl=/clients");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <ClientProfilesDashboard />
      </main>
    </div>
  );
}
