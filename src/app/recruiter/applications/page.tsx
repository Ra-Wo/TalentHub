"use client";

import { useMemo } from "react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useRecruiterApplications } from "@/hooks/job-applications/use-recruiter-applications";
import { type RecruiterApplicationRow } from "@/lib/jobs/applications";

function formatDate(input: string) {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getStatusBadge(status: RecruiterApplicationRow["status"]) {
  switch (status) {
    case "accepted":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        >
          Accepted
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-500 border-red-500/20"
        >
          Rejected
        </Badge>
      );
    case "reviewing":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-500 border-blue-500/20"
        >
          Reviewing
        </Badge>
      );
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
}

function maskCandidateId(id: string) {
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

function getNameFallback(name: string | null, email: string | null) {
  const source = name ?? email ?? "A";
  return source.slice(0, 1).toUpperCase();
}

export default function RecruiterApplicationsPage() {
  const {
    applications,
    isLoading: loading,
    error,
  } = useRecruiterApplications();

  const totalApplications = applications.length;
  const pendingApplications = useMemo(
    () =>
      applications.filter((application) => application.status === "pending")
        .length,
    [applications],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Applications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review all candidate applications across your jobs.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/recruiter">Back to jobs</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Applications</p>
            <p className="text-3xl font-semibold mt-2">{totalApplications}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-3xl font-semibold mt-2">{pendingApplications}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-border/70 px-6 py-4">
          <h2 className="text-lg font-semibold">Candidate Applications</h2>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="py-10 flex items-center justify-center">
              <Spinner />
            </div>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No applications found yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="rounded-xl border border-border/70 bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={application.candidate?.profileImage ?? undefined}
                        />
                        <AvatarFallback>
                          {getNameFallback(
                            application.candidate?.name ?? null,
                            application.candidate?.email ?? null,
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {application.candidate?.name || "Name not available"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {application.candidate?.email ||
                            "Email not available"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {getStatusBadge(application.status)}
                      <p className="text-xs text-muted-foreground">
                        {formatDate(application.appliedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <p className="text-base font-semibold text-foreground">
                      {application.job.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {application.job.department} • {application.job.jobType}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-md border border-border/60 px-3 py-2">
                      <p className="text-[11px] text-muted-foreground">
                        Candidate ID
                      </p>
                      <p className="text-xs font-medium text-foreground mt-1">
                        {maskCandidateId(application.candidateId)}
                      </p>
                    </div>
                    <div className="rounded-md border border-border/60 px-3 py-2">
                      <p className="text-[11px] text-muted-foreground">
                        Resume
                      </p>
                      <p className="text-xs font-medium text-foreground mt-1 truncate">
                        {application.resume ? "Provided" : "Not provided"}
                      </p>
                    </div>
                  </div>

                  {application.coverLetter ? (
                    <div className="mt-4 rounded-md bg-muted/40 px-3 py-2">
                      <p className="text-[11px] text-muted-foreground mb-1">
                        Cover Letter
                      </p>
                      <p className="text-sm text-foreground/85 line-clamp-3">
                        {application.coverLetter}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-4 flex justify-end">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/recruiter/applications/${application.id}`}>
                        Open details
                      </Link>
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
