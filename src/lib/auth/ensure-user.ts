import type { SupabaseClient } from "@supabase/supabase-js";
import { USER_TABLE } from "@/lib/constants";

export type RecruiterRow = {
  id: string;
};

export type CandidateRow = {
  id: string;
  accountType: "candidate" | "recruiter";
};

async function getUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);

  if (!user?.id) {
    throw new Error("Unable to identify recruiter account. Please sign in again.");
  }

  return user;
}

export async function ensureRecruiter(supabase: SupabaseClient): Promise<RecruiterRow> {
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

export async function ensureCandidate(supabase: SupabaseClient): Promise<CandidateRow> {
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
