"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/context/supabase-provider";
import {
  fetchRecruiterApplicationById,
  type RecruiterApplicationRow,
} from "@/lib/job-applications";

type UseRecruiterApplicationResult = {
  application: RecruiterApplicationRow | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
};

export function useRecruiterApplication(applicationId: string): UseRecruiterApplicationResult {
  const supabase = useSupabase();

  const [application, setApplication] = useState<RecruiterApplicationRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadApplication() {
      if (!applicationId) {
        setApplication(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const row = await fetchRecruiterApplicationById(supabase, applicationId);

        if (!cancelled) {
          setApplication(row);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load application details.");
          setApplication(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadApplication();

    return () => {
      cancelled = true;
    };
  }, [applicationId, reloadKey, supabase]);

  return {
    application,
    isLoading,
    error,
    reload: () => setReloadKey((current) => current + 1),
  };
}
