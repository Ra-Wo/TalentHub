"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/context/supabase-provider";
import {
  fetchRecruiterApplicationsByJobId,
  type RecruiterApplicationRow,
} from "@/lib/jobs/applications";
import { fetchRecruiterJobById, type RecruiterJobRow } from "@/lib/jobs/jobs";

type UseRecruiterJobApplicationsResult = {
  job: RecruiterJobRow | null;
  applications: RecruiterApplicationRow[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
};

export function useRecruiterJobApplications(
  jobId: string,
): UseRecruiterJobApplicationsResult {
  const supabase = useSupabase();

  const [job, setJob] = useState<RecruiterJobRow | null>(null);
  const [applications, setApplications] = useState<RecruiterApplicationRow[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadJobApplications() {
      if (!jobId) {
        setJob(null);
        setApplications([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [jobData, rows] = await Promise.all([
          fetchRecruiterJobById(supabase, jobId),
          fetchRecruiterApplicationsByJobId(supabase, jobId),
        ]);

        if (!cancelled) {
          setJob(jobData);
          setApplications(rows);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load applications for this job.",
          );
          setJob(null);
          setApplications([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadJobApplications();

    return () => {
      cancelled = true;
    };
  }, [jobId, reloadKey, supabase]);

  return {
    job,
    applications,
    isLoading,
    error,
    reload: () => setReloadKey((current) => current + 1),
  };
}
