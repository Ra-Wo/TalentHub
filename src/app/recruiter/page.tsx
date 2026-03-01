"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRecruiterJobs } from "@/hooks/jobs";
import { useSupabase } from "@/context/supabase-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DataTable } from "@/components/layout/recruiter-data-table/data-table";
import { getColumns, type Job } from "@/components/layout/recruiter-data-table/columns";
import { type RecruiterJobRow, updateRecruiterJobStatus } from "@/lib/jobs";
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
import { formatDate } from "@/lib/helpers/format";

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
  const { jobs: rawJobs, departments, isLoading: isJobsLoading, reload } = useRecruiterJobs();
  const supabase = useSupabase();
  const jobs = useMemo(() => rawJobs.map(mapApiJobToTable), [rawJobs]);
  const jobsById = useMemo(() => new Map(rawJobs.map((job) => [job.id, job])), [rawJobs]);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const selectedJob = selectedJobId ? (jobsById.get(selectedJobId) ?? null) : null;

  const totalJobs = jobs.length;
  const activeJobs = useMemo(() => jobs.filter((job) => job.status === "Active").length, [jobs]);
  const closedJobs = useMemo(() => jobs.filter((job) => job.status === "Closed").length, [jobs]);

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
      return currentJob.applicants > currentBest.applicants ? currentJob : currentBest;
    }, null);
  }, [jobs]);

  const handleCloseJob = useCallback(
    async (jobId: string) => {
      try {
        await updateRecruiterJobStatus(supabase, jobId, "Closed");
        reload();
      } catch {
        window.alert("Unable to close this job right now. Please try again.");
      }
    },
    [reload, supabase],
  );

  const handleReopenJob = useCallback(
    async (jobId: string) => {
      try {
        await updateRecruiterJobStatus(supabase, jobId, "Active");
        reload();
      } catch {
        window.alert("Unable to reopen this job right now. Please try again.");
      }
    },
    [reload, supabase],
  );

  const columns = useMemo(
    () =>
      getColumns({
        onCloseJob: handleCloseJob,
        onReopenJob: handleReopenJob,
      }),
    [handleCloseJob, handleReopenJob],
  );

  return (
    <div className="relative flex h-full flex-1 flex-col overflow-hidden">
      {/* Header */}
      <header className="z-10 shrink-0 pb-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
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
            <h2 className="text-foreground text-2xl font-bold tracking-tight">Job Listings</h2>
          </div>
          <Button className="bg-primary" asChild>
            <Link href="/recruiter/jobs/new">
              <Plus className="h-5 w-5" />
              Add New Job
            </Link>
          </Button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scroll-smooth pb-10">
        <div className="mx-auto max-w-350 space-y-6">
          {/* Insights Widgets */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Widget 1 */}
            <div className="bg-card border-border group relative overflow-hidden rounded-xl border p-5 shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
                <Briefcase className="text-foreground h-16 w-16" />
              </div>
              <div className="relative z-10 flex flex-col gap-1">
                <p className="text-muted-foreground text-sm font-medium">Total Jobs</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-foreground text-3xl font-bold">{totalJobs}</h3>
                  <span className="flex items-center rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-500">
                    <ArrowUpDown className="mr-0.5 h-3 w-3" /> +12%
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  All positions created by your recruiter account
                </p>
              </div>
            </div>

            {/* Widget 2 */}
            <div className="bg-card border-border group relative overflow-hidden rounded-xl border p-5 shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
                <PieChart className="text-foreground h-16 w-16" />
              </div>
              <div className="relative z-10 flex flex-col gap-1">
                <p className="text-muted-foreground text-sm font-medium">Active vs Closed</p>
                <div className="mt-1 flex items-center gap-3">
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="text-foreground text-2xl font-bold">{activeJobs}</span>
                    <span className="text-xs font-medium text-emerald-500">Active</span>
                  </div>
                  <div className="bg-border h-8 w-px"></div>
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="text-muted-foreground text-2xl font-bold">{closedJobs}</span>
                    <span className="text-xs font-medium text-red-500">Closed</span>
                  </div>
                </div>
                <div className="bg-muted mt-3 flex h-1.5 w-full overflow-hidden rounded-full">
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
            <div className="bg-card border-border group relative overflow-hidden rounded-xl border p-5 shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
                <Flame className="text-foreground h-16 w-16" />
              </div>
              <div className="relative z-10 flex flex-col gap-1">
                <p className="text-muted-foreground text-sm font-medium">Most Applied Position</p>
                <h3 className="text-foreground mt-1 truncate text-xl font-bold">
                  {mostAppliedJob?.title ?? "No data yet"}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <Image
                      width={24}
                      height={24}
                      alt="Applicant 1"
                      className="ring-card inline-block size-6 rounded-full ring-2"
                      src="https://lh3.googleusercontent.com/a/ACg8ocKnVO3y6uIqf5HoRO7KJ6UMsdYeihJKTQX8L4h-aAPVeBJs9tCeBg=s96-c"
                    />
                    <Image
                      width={24}
                      height={24}
                      alt="Applicant 2"
                      className="ring-card inline-block size-6 rounded-full ring-2"
                      src="https://lh3.googleusercontent.com/a/ACg8ocKnVO3y6uIqf5HoRO7KJ6UMsdYeihJKTQX8L4h-aAPVeBJs9tCeBg=s96-c"
                    />
                    <Image
                      width={24}
                      height={24}
                      alt="Applicant 3"
                      className="ring-card inline-block size-6 rounded-full ring-2"
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
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setSelectedJobId(null)} />
          <aside className="border-border bg-background fixed top-0 right-0 z-50 h-full w-full max-w-xl border-l shadow-2xl">
            <div className="flex h-full flex-col">
              <div className="border-border border-b px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Job Details</p>
                    <h3 className="text-foreground mt-1 text-xl font-semibold">
                      {selectedJob.title}
                    </h3>
                    <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {selectedJob.department}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {selectedJob.location?.trim() || selectedJob.locationType}
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
                  <Badge variant="outline">{selectedJob.jobApplicationCount} Applications</Badge>
                </div>

                <div className="border-border/70 mt-4 flex items-center justify-between gap-3 rounded-lg border p-4">
                  <div>
                    <p className="text-foreground text-sm font-medium">Applications</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Open the dedicated page to review all applications for this job.
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={`/recruiter/jobs/${selectedJob.id}/applications`}>
                      View Applications
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-2">
                  <p className="text-foreground text-sm font-medium">Description</p>
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                    {selectedJob.description?.trim() || "No description provided."}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
