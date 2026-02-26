"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useSupabase } from "@/context/supabase-provider";
import { useRecruiterApplication } from "@/hooks/job-applications/use-recruiter-application";
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

function getNameFallback(name: string | null, email: string | null) {
  const source = name ?? email ?? "A";
  return source.slice(0, 1).toUpperCase();
}

export default function RecruiterApplicationDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const applicationId = params.applicationId as string;

  const supabase = useSupabase();
  const { application, isLoading, error } =
    useRecruiterApplication(applicationId);

  const [openingResume, setOpeningResume] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fromJobId = searchParams.get("jobId");
  const backHref = fromJobId
    ? `/recruiter/jobs/${fromJobId}/applications`
    : "/recruiter/applications";

  const handleOpenResume = async (resumeValue: string) => {
    const access = getResumeAccessCandidates(resumeValue);
    if (!access) return;

    setOpeningResume(true);
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
      setOpeningResume(false);
    }
  };

  const displayError = actionError || error;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Application Details
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review candidate and job information for this application.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={backHref}>Back to applications</Link>
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-10 flex items-center justify-center">
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
            <CardHeader className="border-b border-border/70 px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Candidate</h2>
                {getStatusBadge(application.status)}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <Avatar size="lg">
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
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">
                    {application.candidate?.name || "Name not available"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {application.candidate?.email || "Email not available"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Candidate ID: {application.candidateId}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Applied on</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {formatDate(application.appliedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Resume</p>
                  {application.resume ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={() =>
                        handleOpenResume(application.resume as string)
                      }
                      disabled={openingResume}
                    >
                      {openingResume ? "Opening..." : "View Resume"}
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      Resume not provided
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border/70 px-6 py-4">
              <h2 className="text-lg font-semibold">Job</h2>
            </CardHeader>
            <CardContent className="p-6 space-y-2">
              <p className="text-base font-semibold text-foreground">
                {application.job.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {application.job.department} • {application.job.jobType}
              </p>
              <p className="text-xs text-muted-foreground">
                Job status: {application.job.status}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border/70 px-6 py-4">
              <h2 className="text-lg font-semibold">Cover Letter</h2>
            </CardHeader>
            <CardContent className="p-6">
              {application.coverLetter ? (
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No cover letter provided.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
