import type { SupabaseClient, User } from "@supabase/supabase-js";

type AccountType = "candidate" | "recruiter";

const PROFILE_TABLE = "Profile";

function isAccountType(value: unknown): value is AccountType {
  return value === "candidate" || value === "recruiter";
}

function normalizeNullable(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export async function upsertUserProfile(
  supabase: SupabaseClient,
  user: User,
  accountType: AccountType,
): Promise<void> {
  const now = new Date().toISOString();

  const { error } = await supabase.from(PROFILE_TABLE).upsert(
    {
      id: user.id,
      userid: user.id,
      email: user.email,
      name: normalizeNullable(
        user.user_metadata?.full_name ?? user.user_metadata?.name,
      ),
      profileImage: normalizeNullable(user.user_metadata?.avatar_url),
      accountType,
      updatedAt: now,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function getUserAccountType(
  supabase: SupabaseClient,
  user: User,
): Promise<AccountType> {
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .select("accountType")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const profileAccountType = data?.accountType;
  if (isAccountType(profileAccountType)) {
    return profileAccountType;
  }

  const metadataAccountType = user.user_metadata?.account_type;
  if (isAccountType(metadataAccountType)) {
    return metadataAccountType;
  }

  return "candidate";
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  profileImage: string | null;
  accountType: AccountType;
  createdAt: string;
  updatedAt: string;
}

export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Profile not found");
  }

  return data as UserProfile;
}

export interface UpdateUserProfileInput {
  name?: string;
  profileImage?: string;
}

export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: UpdateUserProfileInput,
): Promise<UserProfile> {
  const now = new Date().toISOString();

  const updateData: Record<string, unknown> = {
    updatedAt: now,
  };

  if (updates.name !== undefined) {
    updateData.name = normalizeNullable(updates.name);
  }

  if (updates.profileImage !== undefined) {
    updateData.profileImage = normalizeNullable(updates.profileImage);
  }

  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .update(updateData)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserProfile;
}
