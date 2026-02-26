import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEPARTMENT_TABLE,
  JOB_TABLE,
  ensureRecruiter,
  normalizeDepartmentName,
  normalizeNullable,
} from "./shared";

export type RecruiterJobRow = {
  id: string;
  title: string;
  description: string | null;
  department: string;
  jobType: string;
  location: string | null;
  locationType: "Remote" | "On-site" | "Hybrid";
  salary: string | null;
  status: "Draft" | "Active" | "Closed";
  jobApplicationCount: number;
  createdAt: string;
};

export type PublicJobRow = {
  id: string;
  title: string;
  description: string | null;
  department: string;
  jobType: string;
  location: string | null;
  locationType: "Remote" | "On-site" | "Hybrid";
  salary: string | null;
  status: "Draft" | "Active" | "Closed";
  createdAt: string;
};

export type JobMutationInput = {
  title: string;
  description?: string;
  department: string;
  jobType: string;
  location?: string;
  locationType: "Remote" | "On-site" | "Hybrid";
  salary?: string;
  status: "Draft" | "Active" | "Closed";
};

export async function fetchRecruiterJobs(
  supabase: SupabaseClient,
): Promise<RecruiterJobRow[]> {
  const recruiter = await ensureRecruiter(supabase);

  const { data, error } = await supabase
    .from(JOB_TABLE)
    .select(
      "id,title,department,jobType,location,locationType,status,jobApplicationCount,createdAt,description,salary",
    )
    .eq("recruiterId", recruiter.id)
    .order("createdAt", { ascending: false });

  if (error) throw new Error(error.message);

  const jobs = (data ?? []) as RecruiterJobRow[];
  if (jobs.length === 0) {
    return jobs;
  }

  const jobIds = jobs.map((job) => job.id);
  const { data: applicationRows, error: applicationError } = await supabase
    .from("JobApplication")
    .select("jobId")
    .in("jobId", jobIds);

  if (applicationError) {
    throw new Error(applicationError.message);
  }

  const countsByJobId = (applicationRows ?? []).reduce((accumulator, row) => {
    const jobId = row.jobId as string;
    accumulator.set(jobId, (accumulator.get(jobId) ?? 0) + 1);
    return accumulator;
  }, new Map<string, number>());

  return jobs.map((job) => ({
    ...job,
    jobApplicationCount: countsByJobId.get(job.id) ?? 0,
  }));
}

export async function fetchPublicJobById(
  supabase: SupabaseClient,
  jobId: string,
): Promise<PublicJobRow> {
  const { data, error } = await supabase
    .from(JOB_TABLE)
    .select(
      "id,title,description,department,jobType,location,locationType,salary,status,createdAt",
    )
    .eq("id", jobId)
    .eq("status", "Active")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Job not found or no longer active.");
  }

  return data as PublicJobRow;
}

export async function fetchDepartments(
  supabase: SupabaseClient,
): Promise<string[]> {
  const { data, error } = await supabase
    .from(DEPARTMENT_TABLE)
    .select("name")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((d) => d.name as string);
}

export async function fetchRecruiterJobById(
  supabase: SupabaseClient,
  jobId: string,
): Promise<RecruiterJobRow> {
  const recruiter = await ensureRecruiter(supabase);

  const { data, error } = await supabase
    .from(JOB_TABLE)
    .select(
      "id,title,department,jobType,location,locationType,status,description,salary,jobApplicationCount,createdAt",
    )
    .eq("id", jobId)
    .eq("recruiterId", recruiter.id)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to load job.");
  }

  const { count, error: countError } = await supabase
    .from("JobApplication")
    .select("id", { count: "exact", head: true })
    .eq("jobId", jobId);

  if (countError) {
    throw new Error(countError.message);
  }

  return {
    ...(data as RecruiterJobRow),
    jobApplicationCount: count ?? 0,
  };
}

export async function createJob(
  supabase: SupabaseClient,
  input: JobMutationInput,
): Promise<{ id: string }> {
  const recruiter = await ensureRecruiter(supabase);
  const department = normalizeDepartmentName(input.department);
  if (!department) throw new Error("Department is required.");

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from(JOB_TABLE)
    .insert({
      title: input.title.trim(),
      department,
      jobType: input.jobType.trim(),
      description: normalizeNullable(input.description),
      location: normalizeNullable(input.location),
      locationType: input.locationType,
      salary: normalizeNullable(input.salary),
      status: input.status,
      recruiterId: recruiter.id,
      updatedAt: now,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create job.");
  }

  return data as { id: string };
}

export async function updateJob(
  supabase: SupabaseClient,
  jobId: string,
  input: JobMutationInput,
): Promise<{ id: string }> {
  const recruiter = await ensureRecruiter(supabase);
  const department = normalizeDepartmentName(input.department);
  if (!department) throw new Error("Department is required.");

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from(JOB_TABLE)
    .update({
      title: input.title.trim(),
      department,
      jobType: input.jobType.trim(),
      description: normalizeNullable(input.description),
      location: normalizeNullable(input.location),
      locationType: input.locationType,
      salary: normalizeNullable(input.salary),
      status: input.status,
      updatedAt: now,
    })
    .eq("id", jobId)
    .eq("recruiterId", recruiter.id)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update job.");
  }

  return data as { id: string };
}
