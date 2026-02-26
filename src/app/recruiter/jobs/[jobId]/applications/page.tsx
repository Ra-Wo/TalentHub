"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useSupabase } from "@/context/supabase-provider";
import { useRecruiterJobApplications } from "@/hooks/job-applications/use-recruiter-job-applications";
import { type RecruiterApplicationRow } from "@/lib/jobs/applications";
import { RESUME_BUCKET } from "@/lib/jobs/shared";

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

function getResumeAccessCandidates(resume: string) {
  const storageCandidates: Array<{ bucket: string; path: string }> = [];
  let directUrl: string | null = null;

  if (!resume) return null;

  if (resume.startsWith("http://") || resume.startsWith("https://")) {
    directUrl = resume;

    try {
      const parsedUrl = new URL(resume);
      const decodedPathname = decodeURIComponent(parsedUrl.pathname);
      const storageMatch = decodedPathname.match(
        /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/,
      );

      if (storageMatch) {
        storageCandidates.push({
          bucket: storageMatch[1],
          path: storageMatch[2],
        });
      }
    } catch {
      return { storageCandidates, directUrl };
    }

    return { storageCandidates, directUrl };
  }

  const normalized = resume.replace(/^\/+/, "");
  if (normalized.startsWith(`${RESUME_BUCKET}/`)) {
    storageCandidates.push({
      bucket: RESUME_BUCKET,
      path: normalized.slice(`${RESUME_BUCKET}/`.length),
    });
    return { storageCandidates, directUrl };
  }

  storageCandidates.push({ bucket: RESUME_BUCKET, path: normalized });

  const slashIndex = normalized.indexOf("/");
  if (slashIndex > 0) {
    storageCandidates.push({
      bucket: normalized.slice(0, slashIndex),
      path: normalized.slice(slashIndex + 1),
    });
  }

  return { storageCandidates, directUrl };
}

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

  const handleOpenResume = async (
    applicationId: string,
    resumeValue: string,
  ) => {
    const access = getResumeAccessCandidates(resumeValue);
    if (!access) return;

    setOpeningResumeFor(applicationId);
    setActionError(null);

    try {
      const attempts = access.storageCandidates;

      let signedUrl: string | null = null;
      let lastErrorMessage = "Unable to open resume for this application.";

      for (const attempt of attempts) {
        const { data, error: signedUrlError } = await supabase.storage
          .from(attempt.bucket)
          .createSignedUrl(attempt.path, 60 * 10);

        if (data?.signedUrl && !signedUrlError) {
          signedUrl = data.signedUrl;
          break;
        }

        if (signedUrlError?.message) {
          lastErrorMessage = signedUrlError.message;
        }
      }

      if (!signedUrl) {
        if (access.directUrl) {
          window.open(access.directUrl, "_blank", "noopener,noreferrer");
          return;
        }

        throw new Error(lastErrorMessage);
      }

      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to open candidate resume.",
      );
    } finally {
      setOpeningResumeFor(null);
    }
  };

  const displayError = actionError || loadError;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {job ? `${job.title} Applications` : "Job Applications"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review all candidates who applied to this specific job.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/recruiter">Back to jobs</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b border-border/70 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Applications</h2>
            {job ? (
              <Badge variant="outline">{job.applicantCount} Total</Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="py-10 flex items-center justify-center">
              <Spinner />
            </div>
          ) : displayError ? (
            <p className="text-sm text-red-500">{displayError}</p>
          ) : applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No applications yet for this job.
            </p>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="rounded-xl border border-border/70 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Candidate: {maskCandidateId(application.candidateId)}
                      </p>
                      {application.coverLetter ? (
                        <p className="text-sm text-foreground/85 mt-2 whitespace-pre-wrap">
                          {application.coverLetter}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-2">
                          No cover letter provided.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                      {getStatusBadge(application.status)}
                      <p className="text-xs text-muted-foreground">
                        Applied on {formatDate(application.appliedAt)}
                      </p>
                      {application.resume ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleOpenResume(
                              application.id,
                              application.resume as string,
                            )
                          }
                          disabled={openingResumeFor === application.id}
                        >
                          {openingResumeFor === application.id
                            ? "Opening..."
                            : "View Resume"}
                        </Button>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Resume not provided
                        </p>
                      )}
                    </div>
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
