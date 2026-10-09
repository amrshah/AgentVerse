import ClientProfilesDashboard from "@/components/app/client-profiles-dashboard";
import Header from "@/components/app/header";
import { AVAILABLE_TOOLS } from "@/lib/data";

export default function ClientsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <ClientProfilesDashboard />
      </main>
    </div>
  );
}
