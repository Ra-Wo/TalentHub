"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/context/supabase-provider";
import { fetchRecruiterJobById, type RecruiterJobRow } from "@/lib/jobs";

type UseRecruiterJobResult = {
  job: RecruiterJobRow | null;
  isLoading: boolean;
  error: string | null;
};

export function useRecruiterJob(jobId: string): UseRecruiterJobResult {
  const supabase = useSupabase();

  const [job, setJob] = useState<RecruiterJobRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchRecruiterJobById(supabase, jobId);
        setJob(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load job.");
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [jobId, supabase]);

  return { job, isLoading, error };
}
