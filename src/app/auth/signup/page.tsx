"use client";

import { SignUpForm } from "@/components/feature/auth/signup-form";
import { useAuth, getAccountTypeRoute } from "@/hooks/use-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignUpPage() {
  const { isAuthenticated, loading, accountType } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      const dashboardRoute = getAccountTypeRoute(accountType);
      router.push(dashboardRoute);
    }
  }, [isAuthenticated, loading, accountType, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full border-4 border-border border-t-primary h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-background via-background to-background">
      <div className="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-20 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground">
              Join TalentAI
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a candidate or recruiter account
            </p>
          </div>

          <SignUpForm />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="font-semibold text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
