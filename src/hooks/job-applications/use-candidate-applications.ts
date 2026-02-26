"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/context/supabase-provider";
import {
  fetchCandidateApplications,
  type CandidateApplicationRow,
} from "@/lib/jobs/applications";

type UseCandidateApplicationsResult = {
  applications: CandidateApplicationRow[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
};

export function useCandidateApplications(): UseCandidateApplicationsResult {
  const supabase = useSupabase();
  const [applications, setApplications] = useState<CandidateApplicationRow[]>(
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
        const rows = await fetchCandidateApplications(supabase);
        if (!cancelled) {
          setApplications(rows.filter((row) => row.job));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load applications.",
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
