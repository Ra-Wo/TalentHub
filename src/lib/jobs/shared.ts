import type { SupabaseClient } from "@supabase/supabase-js";

export const USER_TABLE = "Profile";
export const JOB_TABLE = "Job";
export const DEPARTMENT_TABLE = "Department";
export const RESUME_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_RESUME_BUCKET || "resumes";

export type RecruiterRow = {
  id: string;
};

export type CandidateRow = {
  id: string;
  accountType: "candidate" | "recruiter";
};

export function normalizeNullable(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function normalizeDepartmentName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function getUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);

  if (!user?.id) {
    throw new Error(
      "Unable to identify recruiter account. Please sign in again.",
    );
  }

  return user;
}

export async function ensureRecruiter(
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

export async function ensureCandidate(
  supabase: SupabaseClient,
): Promise<CandidateRow> {
  const user = await getUser(supabase);

  const { data, error } = await supabase
    .from(USER_TABLE)
    .select("id,accountType")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Candidate profile not found. Please sign up first.");
  }

  const profile = data as CandidateRow;
  if (profile.accountType !== "candidate") {
    throw new Error("Only candidate accounts can apply to jobs.");
  }

  return profile;
}
