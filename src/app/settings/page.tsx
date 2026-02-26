"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProtectedRoute } from "@/components/feature/protected-route";
import { SettingsForm } from "@/components/feature/settings/settings-form";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="shrink-0 z-10 pb-6">
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                Settings
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage your account and profile information
              </p>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scroll-smooth pb-10">
          <div className="max-w-350 mx-auto">
            <SettingsForm />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
