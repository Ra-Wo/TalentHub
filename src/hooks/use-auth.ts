"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/context/supabase-provider";
import type { User } from "@supabase/supabase-js";

export type AccountType = "candidate" | "recruiter";

export function useAuth() {
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("Auth state changed:", { user, loading, error });

  useEffect(() => {
    async function getUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Auth error");
      } finally {
        setLoading(false);
      }
    }

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const signUp = async (
    email: string,
    password: string,
    accountType: AccountType,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            account_type: accountType,
          },
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (
    email: string,
    password: string,
    accountType?: AccountType,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Only validate/update account type if provided
      if (accountType) {
        const metadataAccountType = data.user?.user_metadata?.account_type;
        if (!metadataAccountType && data.user) {
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              ...data.user.user_metadata,
              account_type: accountType,
            },
          });
          if (updateError) throw updateError;
        }

        if (
          metadataAccountType &&
          metadataAccountType !== accountType &&
          data.user
        ) {
          await supabase.auth.signOut();
          throw new Error(
            `This account is registered as ${metadataAccountType}. Please select ${metadataAccountType} to continue.`,
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign out failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (accountType?: AccountType) => {
    setLoading(true);
    setError(null);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = accountType
        ? `${origin}/auth/callback?account_type=${accountType}`
        : `${origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign in failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    isAuthenticated: !!user,
  };
}
