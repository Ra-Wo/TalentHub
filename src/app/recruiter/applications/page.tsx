"use client";

import { useMemo } from "react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/feature/job-applications/status-badge";
import { useRecruiterApplications } from "@/hooks/job-applications";
import { formatDate, maskCandidateId, getNameFallback } from "@/lib/helpers/format";

export default function RecruiterApplicationsPage() {
  const { applications, isLoading: loading, error } = useRecruiterApplications();

  const totalApplications = applications.length;
  const pendingApplications = useMemo(
    () => applications.filter((application) => application.status === "pending").length,
    [applications],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Applications</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review all candidate applications across your jobs.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/recruiter">Back to jobs</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">Total Applications</p>
            <p className="mt-2 text-3xl font-semibold">{totalApplications}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">Pending Review</p>
            <p className="mt-2 text-3xl font-semibold">{pendingApplications}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-border/70 border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Candidate Applications</h2>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner />
            </div>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : applications.length === 0 ? (
            <p className="text-muted-foreground text-sm">No applications found yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="border-border/70 bg-card rounded-xl border p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar>
                        <AvatarImage src={application.candidate?.profileImage ?? undefined} />
                        <AvatarFallback>
                          {getNameFallback(
                            application.candidate?.name ?? null,
                            application.candidate?.email ?? null,
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-foreground truncate text-sm font-semibold">
                          {application.candidate?.name || "Name not available"}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {application.candidate?.email || "Email not available"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={application.status} />
                      <p className="text-muted-foreground text-xs">
                        {formatDate(application.appliedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <p className="text-foreground text-base font-semibold">
                      {application.job.title}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {application.job.department} • {application.job.jobType}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="border-border/60 rounded-md border px-3 py-2">
                      <p className="text-muted-foreground text-[11px]">Candidate ID</p>
                      <p className="text-foreground mt-1 text-xs font-medium">
                        {maskCandidateId(application.candidateId)}
                      </p>
                    </div>
                    <div className="border-border/60 rounded-md border px-3 py-2">
                      <p className="text-muted-foreground text-[11px]">Resume</p>
                      <p className="text-foreground mt-1 truncate text-xs font-medium">
                        {application.resume ? "Provided" : "Not provided"}
                      </p>
                    </div>
                  </div>

                  {application.coverLetter ? (
                    <div className="bg-muted/40 mt-4 rounded-md px-3 py-2">
                      <p className="text-muted-foreground mb-1 text-[11px]">Cover Letter</p>
                      <p className="text-foreground/85 line-clamp-3 text-sm">
                        {application.coverLetter}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-4 flex justify-end">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/recruiter/applications/${application.id}`}>Open details</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
