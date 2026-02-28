import type { AccountType } from "@/lib/profile/profile.types";

/**
 * Return the root route for a given account type.
 */
export function getAccountTypeRoute(accountType?: AccountType | null): string {
  return accountType === "recruiter" ? "/recruiter" : "/candidate";
}
