"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/context/supabase-provider";
import { getAccountTypeRoute } from "@/lib/helpers/routes";
import { getUserAccountType, upsertUserProfile } from "@/lib/profile";

type AccountType = "candidate" | "recruiter";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = useSupabase();

  useEffect(() => {
    const syncAccountType = async () => {
      const params = new URLSearchParams(window.location.search);
      const requestedAccountType = params.get("account_type") as AccountType | null;

      let resolvedAccountType: AccountType = "candidate";

      if (requestedAccountType === "candidate" || requestedAccountType === "recruiter") {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && user.user_metadata?.account_type !== requestedAccountType) {
          await supabase.auth.updateUser({
            data: {
              ...user.user_metadata,
              account_type: requestedAccountType,
            },
          });
        }

        if (user) {
          await upsertUserProfile(supabase, user, requestedAccountType);
          resolvedAccountType = requestedAccountType;
        }
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          resolvedAccountType = await getUserAccountType(supabase, user);
          await upsertUserProfile(supabase, user, resolvedAccountType);
        }
      }

      const dashboardRoute = getAccountTypeRoute(resolvedAccountType);
      router.replace(dashboardRoute);
    };

    void syncAccountType();
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="border-border border-t-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4" />
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}
