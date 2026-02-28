"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { StatusBadge } from "@/components/feature/job-applications/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useSupabase } from "@/context/supabase-provider";
import { useRecruiterJobApplications } from "@/hooks/job-applications";
import { RESUME_BUCKET } from "@/lib/constants";
import { formatDate, getNameFallback, maskCandidateId } from "@/lib/helpers/format";
import { getResumePath } from "@/lib/helpers/resume";

export default function RecruiterJobApplicationsPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const supabase = useSupabase();
  const {
    job,
    applications,
    isLoading: loading,
    error: loadError,
  } = useRecruiterJobApplications(jobId);
  const [actionError, setActionError] = useState<string | null>(null);
  const [openingResumeFor, setOpeningResumeFor] = useState<string | null>(null);

  const handleOpenResume = async (applicationId: string, resumeValue: string) => {
    setOpeningResumeFor(applicationId);
    setActionError(null);

    try {
      const { data, error: signedUrlError } = await supabase.storage
        .from(RESUME_BUCKET)
        .createSignedUrl(getResumePath(resumeValue), 60 * 10);

      if (signedUrlError?.message) {
        setActionError(signedUrlError.message);
        return;
      }

      window.open(data?.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to open candidate resume.");
    } finally {
      setOpeningResumeFor(null);
    }
  };

  const displayError = actionError || loadError;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            {job ? `${job.title} Applications` : "Job Applications"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review all candidates who applied to this specific job.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/recruiter">Back to jobs</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="border-border/70 border-b px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Applications</h2>
            <Badge variant="outline">{applications.length} Total</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner />
            </div>
          ) : displayError ? (
            <p className="text-sm text-red-500">{displayError}</p>
          ) : applications.length === 0 ? (
            <p className="text-muted-foreground text-sm">No applications yet for this job.</p>
          ) : (
            <div className="space-y-4">
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
                        <p className="text-muted-foreground text-xs">
                          Candidate ID: {maskCandidateId(application.candidateId)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={application.status} />
                      <p className="text-muted-foreground text-xs">
                        Applied on {formatDate(application.appliedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {application.coverLetter ? (
                      <div className="bg-muted/40 rounded-md px-3 py-2">
                        <p className="text-muted-foreground mb-1 text-[11px]">Cover Letter</p>
                        <p className="text-foreground/85 line-clamp-4 text-sm whitespace-pre-wrap">
                          {application.coverLetter}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No cover letter provided.</p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                    <Button asChild type="button" variant="outline" size="sm">
                      <Link href={`/recruiter/applications/${application.id}?jobId=${jobId}`}>
                        Open details
                      </Link>
                    </Button>
                    {application.resume ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleOpenResume(application.id, application.resume as string)
                        }
                        disabled={openingResumeFor === application.id}
                      >
                        {openingResumeFor === application.id ? "Opening..." : "View Resume"}
                      </Button>
                    ) : (
                      <p className="text-muted-foreground text-xs">Resume not provided</p>
                    )}
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
