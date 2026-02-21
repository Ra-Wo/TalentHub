"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";
import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <svg
              aria-hidden="true"
              viewBox="0 0 48 48"
              className="h-6 w-6 text-primary"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="currentColor"
                opacity="0.2"
              />
              <circle cx="24" cy="24" r="12" fill="currentColor" />
              <circle cx="32" cy="16" r="4" fill="currentColor" opacity="0.9" />
            </svg>
          </div>
          <span className="font-semibold text-foreground">TalentAI</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/dashboard" className="transition hover:text-foreground">
            Dashboard
          </Link>
          <Link
            href="/dashboard/roles"
            className="transition hover:text-foreground"
          >
            Roles
          </Link>
          <Link
            href="/dashboard/candidates"
            className="transition hover:text-foreground"
          >
            Candidates
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <div className="hidden flex-col items-end sm:flex">
              <p className="text-sm font-medium text-foreground">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground">Account</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-lg"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
