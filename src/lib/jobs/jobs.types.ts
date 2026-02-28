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
  jobApplicationCount: number;
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
