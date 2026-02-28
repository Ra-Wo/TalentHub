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
  candidate: {
    id: string;
    name: string | null;
    email: string;
    profileImage: string | null;
  } | null;
  job: {
    id: string;
    title: string;
    department: string;
    jobType: string;
    status: "Draft" | "Active" | "Closed";
  };
};
