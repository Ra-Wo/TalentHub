"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRecruiterJobs } from "@/hooks/jobs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DataTable } from "@/components/layout/recruiter-data-table/data-table";
import {
  columns,
  type Job,
} from "@/components/layout/recruiter-data-table/columns";
import { type RecruiterJobRow } from "@/lib/jobs/jobs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Briefcase,
  PieChart,
  Flame,
  ArrowUpDown,
  X,
  MapPin,
  CalendarDays,
  Building2,
} from "lucide-react";

function formatDate(input: string) {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function mapApiJobToTable(job: RecruiterJobRow): Job {
  const primaryLocation = job.location?.trim() || job.locationType;
  return {
    id: job.id,
    title: job.title,
    type: `${primaryLocation} • ${job.jobType}`,
    department: job.department,
    status: job.status,
    applicants: job.jobApplicationCount,
    extraApplicants: null,
    date: formatDate(job.createdAt),
  };
}

export default function RecruiterPage() {
  const {
    jobs: rawJobs,
    departments,
    isLoading: isJobsLoading,
  } = useRecruiterJobs();
  const jobs = useMemo(() => rawJobs.map(mapApiJobToTable), [rawJobs]);
  const jobsById = useMemo(
    () => new Map(rawJobs.map((job) => [job.id, job])),
    [rawJobs],
  );

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const selectedJob = selectedJobId
    ? (jobsById.get(selectedJobId) ?? null)
    : null;

  const totalJobs = jobs.length;
  const activeJobs = useMemo(
    () => jobs.filter((job) => job.status === "Active").length,
    [jobs],
  );
  const closedJobs = useMemo(
    () => jobs.filter((job) => job.status === "Closed").length,
    [jobs],
  );

  const activeJobsPercentage = useMemo(() => {
    if (totalJobs === 0) return 0;
    return Math.round((activeJobs / totalJobs) * 100);
  }, [activeJobs, totalJobs]);

  const closedJobsPercentage = useMemo(() => {
    if (totalJobs === 0) return 0;
    return Math.round((closedJobs / totalJobs) * 100);
  }, [closedJobs, totalJobs]);

  const mostAppliedJob = useMemo(() => {
    return jobs.reduce<Job | null>((currentBest, currentJob) => {
      if (!currentBest) return currentJob;
      return currentJob.applicants > currentBest.applicants
        ? currentJob
        : currentBest;
    }, null);
  }, [jobs]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <header className="shrink-0 z-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Breadcrumb className="mb-2">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Job Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Job Listings
            </h2>
          </div>
          <Button className="bg-primary" asChild>
            <Link href="/recruiter/jobs/new">
              <Plus className="w-5 h-5" />
              Add New Job
            </Link>
          </Button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scroll-smooth pb-10">
        <div className="max-w-350 mx-auto space-y-6">
          {/* Insights Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Widget 1 */}
            <div className="bg-card rounded-xl p-5 border border-border shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Briefcase className="w-16 h-16 text-foreground" />
              </div>
              <div className="flex flex-col gap-1 relative z-10">
                <p className="text-muted-foreground text-sm font-medium">
                  Total Jobs
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-foreground">
                    {totalJobs}
                  </h3>
                  <span className="text-emerald-500 text-xs font-medium flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    <ArrowUpDown className="w-3 h-3 mr-0.5" /> +12%
                  </span>
                </div>
                <p className="text-muted-foreground text-xs mt-2">
                  All positions created by your recruiter account
                </p>
              </div>
            </div>

            {/* Widget 2 */}
            <div className="bg-card rounded-xl p-5 border border-border shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <PieChart className="w-16 h-16 text-foreground" />
              </div>
              <div className="flex flex-col gap-1 relative z-10">
                <p className="text-muted-foreground text-sm font-medium">
                  Active vs Closed
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-2xl font-bold text-foreground">
                      {activeJobs}
                    </span>
                    <span className="text-xs text-emerald-500 font-medium">
                      Active
                    </span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {closedJobs}
                    </span>
                    <span className="text-xs text-red-500 font-medium">
                      Closed
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full mt-3 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${activeJobsPercentage}%` }}
                  ></div>
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${closedJobsPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Widget 3 */}
            <div className="bg-card rounded-xl p-5 border border-border shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Flame className="w-16 h-16 text-foreground" />
              </div>
              <div className="flex flex-col gap-1 relative z-10">
                <p className="text-muted-foreground text-sm font-medium">
                  Most Applied Position
                </p>
                <h3 className="text-xl font-bold text-foreground mt-1 truncate">
                  {mostAppliedJob?.title ?? "No data yet"}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex -space-x-2">
                    <Image
                      width={24}
                      height={24}
                      alt="Applicant 1"
                      className="inline-block size-6 rounded-full ring-2 ring-card"
                      src="https://lh3.googleusercontent.com/a/ACg8ocKnVO3y6uIqf5HoRO7KJ6UMsdYeihJKTQX8L4h-aAPVeBJs9tCeBg=s96-c"
                    />
                    <Image
                      width={24}
                      height={24}
                      alt="Applicant 2"
                      className="inline-block size-6 rounded-full ring-2 ring-card"
                      src="https://lh3.googleusercontent.com/a/ACg8ocKnVO3y6uIqf5HoRO7KJ6UMsdYeihJKTQX8L4h-aAPVeBJs9tCeBg=s96-c"
                    />
                    <Image
                      width={24}
                      height={24}
                      alt="Applicant 3"
                      className="inline-block size-6 rounded-full ring-2 ring-card"
                      src="https://lh3.googleusercontent.com/a/ACg8ocKnVO3y6uIqf5HoRO7KJ6UMsdYeihJKTQX8L4h-aAPVeBJs9tCeBg=s96-c"
                    />
                  </div>
                  <span className="text-sm font-semibold text-blue-500">
                    {mostAppliedJob?.applicants ?? 0} Applicants
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Management Section */}
          <DataTable
            columns={columns}
            data={jobs}
            departments={departments}
            isLoading={isJobsLoading}
            onRowClick={(job) => setSelectedJobId(job.id)}
          />
        </div>
      </div>

      {selectedJob ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setSelectedJobId(null)}
          />
          <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-xl border-l border-border bg-background shadow-2xl">
            <div className="flex h-full flex-col">
              <div className="border-b border-border px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Job Details</p>
                    <h3 className="mt-1 text-xl font-semibold text-foreground">
                      {selectedJob.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {selectedJob.department}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {selectedJob.location?.trim() ||
                          selectedJob.locationType}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Created {formatDate(selectedJob.createdAt)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setSelectedJobId(null)}
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="outline">{selectedJob.status}</Badge>
                  <Badge variant="outline">{selectedJob.jobType}</Badge>
                  <Badge variant="outline">
                    {selectedJob.jobApplicationCount} Applications
                  </Badge>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Description
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedJob.description?.trim() ||
                      "No description provided."}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-border/70 p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Applications
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Open the dedicated page to review all applications for
                      this job.
                    </p>
                  </div>
                  <Button asChild>
                    <Link
                      href={`/recruiter/jobs/${selectedJob.id}/applications`}
                    >
                      View Applications
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
