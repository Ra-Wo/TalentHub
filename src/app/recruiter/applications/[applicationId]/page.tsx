"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";

import { StatusBadge } from "@/components/feature/job-applications/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useSupabase } from "@/context/supabase-provider";
import { useRecruiterApplication } from "@/hooks/job-applications";
import { RESUME_BUCKET } from "@/lib/constants";
import { formatDate, getNameFallback } from "@/lib/helpers/format";
import { getResumePath } from "@/lib/helpers/resume";

export default function RecruiterApplicationDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const applicationId = params.applicationId as string;

  const supabase = useSupabase();
  const { application, isLoading, error } = useRecruiterApplication(applicationId);

  const [openingResume, setOpeningResume] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fromJobId = searchParams.get("jobId");
  const backHref = fromJobId
    ? `/recruiter/jobs/${fromJobId}/applications`
    : "/recruiter/applications";

  const handleOpenResume = async (resumeValue: string) => {
    setOpeningResume(true);
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
      setOpeningResume(false);
    }
  };

  const displayError = actionError || error;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Application Details
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review candidate and job information for this application.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={backHref}>Back to applications</Link>
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-10">
            <Spinner />
          </CardContent>
        </Card>
      ) : displayError ? (
        <Card>
          <CardContent className="py-10">
            <p className="text-sm text-red-500">{displayError}</p>
          </CardContent>
        </Card>
      ) : application ? (
        <>
          <Card>
            <CardHeader className="border-border/70 border-b px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Candidate</h2>
                <StatusBadge status={application.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  <AvatarImage src={application.candidate?.profileImage ?? undefined} />
                  <AvatarFallback>
                    {getNameFallback(
                      application.candidate?.name ?? null,
                      application.candidate?.email ?? null,
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-foreground text-base font-semibold">
                    {application.candidate?.name || "Name not available"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {application.candidate?.email || "Email not available"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Candidate ID: {application.candidateId}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-xs">Applied on</p>
                  <p className="text-foreground mt-1 text-sm font-medium">
                    {formatDate(application.appliedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Resume</p>
                  {application.resume ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={() => handleOpenResume(application.resume as string)}
                      disabled={openingResume}
                    >
                      {openingResume ? "Opening..." : "View Resume"}
                    </Button>
                  ) : (
                    <p className="text-muted-foreground mt-1 text-sm">Resume not provided</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-border/70 border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Job</h2>
            </CardHeader>
            <CardContent className="space-y-2 p-6">
              <p className="text-foreground text-base font-semibold">{application.job.title}</p>
              <p className="text-muted-foreground text-sm">
                {application.job.department} • {application.job.jobType}
              </p>
              <p className="text-muted-foreground text-xs">Job status: {application.job.status}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-border/70 border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Cover Letter</h2>
            </CardHeader>
            <CardContent className="p-6">
              {application.coverLetter ? (
                <p className="text-foreground/90 text-sm whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">No cover letter provided.</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
