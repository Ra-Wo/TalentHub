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
      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="z-10 shrink-0 pb-6">
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
            <div className="bg-primary/10 rounded-full p-2">
              <Settings className="text-primary h-6 w-6" />
            </div>
            <div>
              <h2 className="text-foreground text-2xl font-bold tracking-tight">Settings</h2>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Manage your account and profile information
              </p>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scroll-smooth pb-10">
          <div className="mx-auto max-w-350">
            <SettingsForm />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
