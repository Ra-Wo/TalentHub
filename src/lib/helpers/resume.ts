import { RESUME_BUCKET } from "@/lib/constants";

export function getResumePath(resume: string): string {
  const normalized = resume.replace(/^\/+/, "");
  if (normalized.startsWith(`${RESUME_BUCKET}/`)) {
    return normalized.slice(`${RESUME_BUCKET}/`.length);
  } else {
    return normalized;
  }
}
