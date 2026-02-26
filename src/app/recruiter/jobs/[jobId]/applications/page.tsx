"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

function getNameFallback(name: string | null, email: string | null) {
  const source = name ?? email ?? "A";
  return source.slice(0, 1).toUpperCase();
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
            <Badge variant="outline">{applications.length} Total</Badge>
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
                        <p className="text-xs text-muted-foreground">
                          Candidate ID:{" "}
                          {maskCandidateId(application.candidateId)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(application.status)}
                      <p className="text-xs text-muted-foreground">
                        Applied on {formatDate(application.appliedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {application.coverLetter ? (
                      <div className="rounded-md bg-muted/40 px-3 py-2">
                        <p className="text-[11px] text-muted-foreground mb-1">
                          Cover Letter
                        </p>
                        <p className="text-sm text-foreground/85 line-clamp-4 whitespace-pre-wrap">
                          {application.coverLetter}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No cover letter provided.
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                    <Button asChild type="button" variant="outline" size="sm">
                      <Link
                        href={`/recruiter/applications/${application.id}?jobId=${jobId}`}
                      >
                        Open details
                      </Link>
                    </Button>
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
