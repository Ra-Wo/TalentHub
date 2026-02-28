"use client";

import { SignInForm } from "@/components/feature/auth/signin-form";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const { isAuthenticated, loading, accountType } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  useEffect(() => {
    if (isAuthenticated && !loading) {
      if (redirectTo?.startsWith("/")) {
        router.push(redirectTo);
        return;
      }

      const dashboardRoute = accountType === "recruiter" ? "/recruiter" : "/candidate";
      router.push(dashboardRoute);
    }
  }, [isAuthenticated, loading, accountType, router, redirectTo]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-border border-t-primary h-12 w-12 animate-spin rounded-full border-4" />
      </div>
    );
  }

  return (
    <div className="from-background via-background to-background relative min-h-screen overflow-hidden bg-linear-to-b">
      <div className="bg-primary/15 pointer-events-none absolute top-10 -left-40 h-80 w-80 rounded-full blur-3xl" />
      <div className="bg-secondary/20 pointer-events-none absolute top-20 right-10 h-96 w-96 rounded-full blur-3xl" />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-foreground text-2xl font-semibold">Welcome back</h1>
            <p className="text-muted-foreground mt-2 text-sm">Sign in to your TalentHub account</p>
          </div>

          <SignInForm />

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Don{"'"}t have an account?{" "}
              <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
