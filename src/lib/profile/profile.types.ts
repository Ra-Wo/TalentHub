export type AccountType = "candidate" | "recruiter";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  profileImage: string | null;
  accountType: AccountType;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileInput {
  name?: string;
  profileImage?: string;
}
