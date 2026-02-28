/**
 * Trim a string and return `null` when empty / undefined.
 */
export function normalizeNullable(value?: string): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

/**
 * Collapse whitespace in a department name.
 */
export function normalizeDepartmentName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/**
 * Strip non-safe characters from a file name for storage uploads.
 */
export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}
