"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/context/supabase-provider";
import { fetchDepartments, fetchRecruiterJobs, type RecruiterJobRow } from "@/lib/jobs";

type UseRecruiterJobsResult = {
  jobs: RecruiterJobRow[];
  departments: string[];
  isLoading: boolean;
  reload: () => void;
};

export function useRecruiterJobs(): UseRecruiterJobsResult {
  const { user, loading: isAuthLoading } = useAuth();
  const supabase = useSupabase();

  const [jobs, setJobs] = useState<RecruiterJobRow[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (isAuthLoading) {
        setIsLoading(true);
        return;
      }

      if (!user?.id) {
        setJobs([]);
        setDepartments([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const [fetchedJobs, fetchedDepartments] = await Promise.all([
          fetchRecruiterJobs(supabase),
          fetchDepartments(supabase),
        ]);
        setJobs(fetchedJobs);
        setDepartments(fetchedDepartments);
      } catch {
        setJobs([]);
        setDepartments([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [isAuthLoading, supabase, user?.id, reloadKey]);

  return {
    jobs,
    departments,
    isLoading,
    reload: () => setReloadKey((k) => k + 1),
  };
}
