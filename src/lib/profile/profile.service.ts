import type { SupabaseClient, User } from "@supabase/supabase-js";
import { USER_TABLE } from "@/lib/constants";
import { normalizeNullable } from "@/lib/helpers/sanitize";
import type { AccountType, UpdateUserProfileInput, UserProfile } from "./profile.types";

function isAccountType(value: unknown): value is AccountType {
  return value === "candidate" || value === "recruiter";
}

export async function upsertUserProfile(
  supabase: SupabaseClient,
  user: User,
  accountType: AccountType,
): Promise<void> {
  const now = new Date().toISOString();

  const { error } = await supabase.from(USER_TABLE).upsert(
    {
      id: user.id,
      userid: user.id,
      email: user.email,
      name: normalizeNullable(user.user_metadata?.full_name ?? user.user_metadata?.name),
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
    .from(USER_TABLE)
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

export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from(USER_TABLE)
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
    .from(USER_TABLE)
    .update(updateData)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserProfile;
}
