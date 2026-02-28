/**
 * Format an ISO date string into a short human-readable form.
 * Example: "Feb 26, 2026"
 */
export function formatDate(input: string): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

/**
 * Show a truncated candidate id like `4356be...2613`.
 */
export function maskCandidateId(id: string): string {
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

/**
 * Return the first character of a name or email (uppercased) for avatar fallbacks.
 */
export function getNameFallback(name: string | null, email: string | null): string {
  const source = name ?? email ?? "A";
  return source.slice(0, 1).toUpperCase();
}
