"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/context/supabase-provider";
import {
  fetchRecruiterApplications,
  type RecruiterApplicationRow,
} from "@/lib/jobs/applications";

type UseRecruiterApplicationsResult = {
  applications: RecruiterApplicationRow[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
};

export function useRecruiterApplications(): UseRecruiterApplicationsResult {
  const supabase = useSupabase();

  const [applications, setApplications] = useState<RecruiterApplicationRow[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadApplications() {
      setIsLoading(true);
      setError(null);

      try {
        const rows = await fetchRecruiterApplications(supabase);
        if (!cancelled) {
          setApplications(rows);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load recruiter applications.",
          );
          setApplications([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadApplications();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, supabase]);

  return {
    applications,
    isLoading,
    error,
    reload: () => setReloadKey((current) => current + 1),
  };
}
