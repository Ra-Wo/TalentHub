import type { SupabaseClient } from "@supabase/supabase-js";

const USER_TABLE = "Profile";
const JOB_TABLE = "Job";

type RecruiterRow = {
  id: string;
};

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
  applicantCount: number;
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

function normalizeNullable(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

async function getUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user?.id) {
    throw new Error(
      "Unable to identify recruiter account. Please sign in again.",
    );
  }

  return user;
}

async function ensureRecruiter(
  supabase: SupabaseClient,
): Promise<RecruiterRow> {
  const user = await getUser(supabase);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from(USER_TABLE)
    .upsert(
      {
        id: user.id,
        userid: user.id,
        email: user.email,
        accountType: "recruiter",
        updatedAt: now,
      },
      { onConflict: "id" },
    )
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to load recruiter profile.");
  }

  return data as RecruiterRow;
}

export async function listRecruiterJobs(
  supabase: SupabaseClient,
): Promise<RecruiterJobRow[]> {
  const recruiter = await ensureRecruiter(supabase);

  const { data, error } = await supabase
    .from(JOB_TABLE)
    .select(
      "id,title,department,jobType,location,locationType,status,applicantCount,createdAt,description,salary",
    )
    .eq("recruiterId", recruiter.id)
    .order("createdAt", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as RecruiterJobRow[];
}

export async function getRecruiterJobById(
  supabase: SupabaseClient,
  jobId: string,
): Promise<RecruiterJobRow> {
  const recruiter = await ensureRecruiter(supabase);

  const { data, error } = await supabase
    .from(JOB_TABLE)
    .select(
      "id,title,department,jobType,location,locationType,status,description,salary,applicantCount,createdAt",
    )
    .eq("id", jobId)
    .eq("recruiterId", recruiter.id)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to load job.");
  }

  return data as RecruiterJobRow;
}

export async function createRecruiterJob(
  supabase: SupabaseClient,
  input: JobMutationInput,
): Promise<{ id: string }> {
  const recruiter = await ensureRecruiter(supabase);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from(JOB_TABLE)
    .insert({
      title: input.title.trim(),
      department: input.department.trim(),
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

export async function updateRecruiterJob(
  supabase: SupabaseClient,
  jobId: string,
  input: JobMutationInput,
): Promise<{ id: string }> {
  const recruiter = await ensureRecruiter(supabase);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from(JOB_TABLE)
    .update({
      title: input.title.trim(),
      department: input.department.trim(),
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
