import type { SupabaseClient } from "@supabase/supabase-js";

const USER_TABLE = "Profile";
const JOB_TABLE = "Job";
const DEPARTMENT_TABLE = "Department";
const RESUME_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_RESUME_BUCKET || "resumes";

type RecruiterRow = {
  id: string;
};

type CandidateRow = {
  id: string;
  accountType: "candidate" | "recruiter";
};

export type RecruiterJobRow = {
  id: string;
  title: string;
  description: string | null;
  department: string;
  jobType: string;
  location: string | null;
  locationType: "Remote" | "On-site" | "Hybrid";
  salary: string | null;
  status: "Draft" | "Active" | "Closed";
  applicantCount: number;
  createdAt: string;
};

export type PublicJobRow = {
  id: string;
  title: string;
  description: string | null;
  department: string;
  jobType: string;
  location: string | null;
  locationType: "Remote" | "On-site" | "Hybrid";
  salary: string | null;
  status: "Draft" | "Active" | "Closed";
  createdAt: string;
};

export type JobMutationInput = {
  title: string;
  description?: string;
  department: string;
  jobType: string;
  location?: string;
  locationType: "Remote" | "On-site" | "Hybrid";
  salary?: string;
  status: "Draft" | "Active" | "Closed";
};

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

function normalizeNullable(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeDepartmentName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function sanitizeFileName(name: string) {
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

async function ensureRecruiter(
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

async function ensureCandidate(
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

async function getApplicantCountMap(
  supabase: SupabaseClient,
  jobIds: string[],
): Promise<Record<string, number>> {
  if (jobIds.length === 0) return {};

  const { data, error } = await supabase
    .from("JobApplication")
    .select("jobId")
    .in("jobId", jobIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).reduce<Record<string, number>>((accumulator, row) => {
    const key = row.jobId as string;
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
}

export async function fetchRecruiterJobs(
  supabase: SupabaseClient,
): Promise<RecruiterJobRow[]> {
  const recruiter = await ensureRecruiter(supabase);

  const { data, error } = await supabase
    .from(JOB_TABLE)
    .select(
      "id,title,department,jobType,location,locationType,status,applicantCount,createdAt,description,salary",
    )
    .eq("recruiterId", recruiter.id)
    .order("createdAt", { ascending: false });

  if (error) throw new Error(error.message);

  const jobs = (data ?? []) as RecruiterJobRow[];
  const applicantCountMap = await getApplicantCountMap(
    supabase,
    jobs.map((job) => job.id),
  );

  return jobs.map((job) => ({
    ...job,
    applicantCount: applicantCountMap[job.id] ?? 0,
  }));
}

export async function fetchPublicJobById(
  supabase: SupabaseClient,
  jobId: string,
): Promise<PublicJobRow> {
  const { data, error } = await supabase
    .from(JOB_TABLE)
    .select(
      "id,title,description,department,jobType,location,locationType,salary,status,createdAt",
    )
    .eq("id", jobId)
    .eq("status", "Active")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Job not found or no longer active.");
  }

  return data as PublicJobRow;
}

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

export async function fetchDepartments(
  supabase: SupabaseClient,
): Promise<string[]> {
  const { data, error } = await supabase
    .from(DEPARTMENT_TABLE)
    .select("name")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((d) => d.name as string);
}

export async function fetchRecruiterJobById(
  supabase: SupabaseClient,
  jobId: string,
): Promise<RecruiterJobRow> {
  const recruiter = await ensureRecruiter(supabase);

  const { data, error } = await supabase
    .from(JOB_TABLE)
    .select(
      "id,title,department,jobType,location,locationType,status,description,salary,applicantCount,createdAt",
    )
    .eq("id", jobId)
    .eq("recruiterId", recruiter.id)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to load job.");
  }

  const job = data as RecruiterJobRow;
  const applicantCountMap = await getApplicantCountMap(supabase, [job.id]);

  return {
    ...job,
    applicantCount: applicantCountMap[job.id] ?? 0,
  };
}

export async function createJob(
  supabase: SupabaseClient,
  input: JobMutationInput,
): Promise<{ id: string }> {
  const recruiter = await ensureRecruiter(supabase);
  const department = normalizeDepartmentName(input.department);
  if (!department) throw new Error("Department is required.");

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from(JOB_TABLE)
    .insert({
      title: input.title.trim(),
      department,
      jobType: input.jobType.trim(),
      description: normalizeNullable(input.description),
      location: normalizeNullable(input.location),
      locationType: input.locationType,
      salary: normalizeNullable(input.salary),
      status: input.status,
      recruiterId: recruiter.id,
      updatedAt: now,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create job.");
  }

  return data as { id: string };
}

export async function updateJob(
  supabase: SupabaseClient,
  jobId: string,
  input: JobMutationInput,
): Promise<{ id: string }> {
  const recruiter = await ensureRecruiter(supabase);
  const department = normalizeDepartmentName(input.department);
  if (!department) throw new Error("Department is required.");

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from(JOB_TABLE)
    .update({
      title: input.title.trim(),
      department,
      jobType: input.jobType.trim(),
      description: normalizeNullable(input.description),
      location: normalizeNullable(input.location),
      locationType: input.locationType,
      salary: normalizeNullable(input.salary),
      status: input.status,
      updatedAt: now,
    })
    .eq("id", jobId)
    .eq("recruiterId", recruiter.id)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update job.");
  }

  return data as { id: string };
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
