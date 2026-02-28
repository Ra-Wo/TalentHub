import { ProtectedRoute } from "@/components/feature/protected-route";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default function RecruiterDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="bg-background min-h-screen">
        <DashboardHeader />
        <main className="mx-auto max-w-6xl px-6 py-8 sm:px-10">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
