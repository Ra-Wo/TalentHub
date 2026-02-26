import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchPublicJobById, fetchRecruiterJobById } from "./jobs";
import {
  RESUME_BUCKET,
  ensureCandidate,
  ensureRecruiter,
  normalizeNullable,
  sanitizeFileName,
} from "./shared";

export type JobApplicationInput = {
  jobId: string;
  resume?: string;
  coverLetter?: string;
};

export type CandidateApplicationRow = {
  id: string;
  status: "pending" | "reviewing" | "rejected" | "accepted";
  appliedAt: string;
  resume: string | null;
  coverLetter: string | null;
  job: {
    id: string;
    title: string;
    department: string;
    jobType: string;
    location: string | null;
    locationType: "Remote" | "On-site" | "Hybrid";
    salary: string | null;
    status: "Draft" | "Active" | "Closed";
    createdAt: string;
  };
};

export type RecruiterApplicationRow = {
  id: string;
  status: "pending" | "reviewing" | "rejected" | "accepted";
  appliedAt: string;
  resume: string | null;
  coverLetter: string | null;
  candidateId: string;
  job: {
    id: string;
    title: string;
    department: string;
    jobType: string;
    status: "Draft" | "Active" | "Closed";
  };
};

export async function fetchCandidateApplications(
  supabase: SupabaseClient,
): Promise<CandidateApplicationRow[]> {
  const candidate = await ensureCandidate(supabase);

  const { data, error } = await supabase
    .from("JobApplication")
    .select(
      `
      id,
      status,
      appliedAt,
      resume,
      coverLetter,
      job:Job(
        id,
        title,
        department,
        jobType,
        location,
        locationType,
        salary,
        status,
        createdAt
      )
    `,
    )
    .eq("candidateId", candidate.id)
    .order("appliedAt", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as Array<{
    id: string;
    status: CandidateApplicationRow["status"];
    appliedAt: string;
    resume: string | null;
    coverLetter: string | null;
    job:
      | CandidateApplicationRow["job"]
      | CandidateApplicationRow["job"][]
      | null;
  }>;

  return rows
    .map((row) => {
      const normalizedJob = Array.isArray(row.job) ? row.job[0] : row.job;
      if (!normalizedJob) {
        return null;
      }

      return {
        id: row.id,
        status: row.status,
        appliedAt: row.appliedAt,
        resume: row.resume,
        coverLetter: row.coverLetter,
        job: normalizedJob,
      } satisfies CandidateApplicationRow;
    })
    .filter((row): row is CandidateApplicationRow => row !== null);
}

export async function fetchRecruiterApplications(
  supabase: SupabaseClient,
): Promise<RecruiterApplicationRow[]> {
  await ensureRecruiter(supabase);

  const { data, error } = await supabase
    .from("JobApplication")
    .select(
      `
      id,
      status,
      appliedAt,
      resume,
      coverLetter,
      candidateId,
      job:Job(
        id,
        title,
        department,
        jobType,
        status
      )
    `,
    )
    .order("appliedAt", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as Array<{
    id: string;
    status: RecruiterApplicationRow["status"];
    appliedAt: string;
    resume: string | null;
    coverLetter: string | null;
    candidateId: string;
    job:
      | RecruiterApplicationRow["job"]
      | RecruiterApplicationRow["job"][]
      | null;
  }>;

  return rows
    .map((row) => {
      const normalizedJob = Array.isArray(row.job) ? row.job[0] : row.job;
      if (!normalizedJob) {
        return null;
      }

      return {
        id: row.id,
        status: row.status,
        appliedAt: row.appliedAt,
        resume: row.resume,
        coverLetter: row.coverLetter,
        candidateId: row.candidateId,
        job: normalizedJob,
      } satisfies RecruiterApplicationRow;
    })
    .filter((row): row is RecruiterApplicationRow => row !== null);
}

export async function fetchRecruiterApplicationsByJobId(
  supabase: SupabaseClient,
  jobId: string,
): Promise<RecruiterApplicationRow[]> {
  await fetchRecruiterJobById(supabase, jobId);

  const { data, error } = await supabase
    .from("JobApplication")
    .select(
      `
      id,
      status,
      appliedAt,
      resume,
      coverLetter,
      candidateId,
      job:Job(
        id,
        title,
        department,
        jobType,
        status
      )
    `,
    )
    .eq("jobId", jobId)
    .order("appliedAt", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as Array<{
    id: string;
    status: RecruiterApplicationRow["status"];
    appliedAt: string;
    resume: string | null;
    coverLetter: string | null;
    candidateId: string;
    job:
      | RecruiterApplicationRow["job"]
      | RecruiterApplicationRow["job"][]
      | null;
  }>;

  return rows
    .map((row) => {
      const normalizedJob = Array.isArray(row.job) ? row.job[0] : row.job;
      if (!normalizedJob) {
        return null;
      }

      return {
        id: row.id,
        status: row.status,
        appliedAt: row.appliedAt,
        resume: row.resume,
        coverLetter: row.coverLetter,
        candidateId: row.candidateId,
        job: normalizedJob,
      } satisfies RecruiterApplicationRow;
    })
    .filter((row): row is RecruiterApplicationRow => row !== null);
}

export async function applyToJob(
  supabase: SupabaseClient,
  input: JobApplicationInput,
): Promise<{ id: string }> {
  const candidate = await ensureCandidate(supabase);
  await fetchPublicJobById(supabase, input.jobId);

  const { data, error } = await supabase
    .from("JobApplication")
    .insert({
      jobId: input.jobId,
      candidateId: candidate.id,
      resume: normalizeNullable(input.resume),
      coverLetter: normalizeNullable(input.coverLetter),
    })
    .select("id")
    .single();

  if (error || !data) {
    const message = error?.message ?? "Failed to submit application.";
    if (message.toLowerCase().includes("duplicate")) {
      throw new Error("You have already applied for this job.");
    }
    throw new Error(message);
  }

  return data as { id: string };
}

export async function uploadCandidateResumePdf(
  supabase: SupabaseClient,
  jobId: string,
  file: File,
): Promise<string> {
  const candidate = await ensureCandidate(supabase);

  const lowerName = file.name.toLowerCase();
  const isPdf = file.type === "application/pdf" || lowerName.endsWith(".pdf");
  if (!isPdf) {
    throw new Error("Please upload a PDF resume.");
  }

  const safeName = sanitizeFileName(file.name);
  const path = `${candidate.id}/${jobId}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: "application/pdf",
    });

  if (error) {
    throw new Error(error.message);
  }

  return `${RESUME_BUCKET}/${path}`;
}
