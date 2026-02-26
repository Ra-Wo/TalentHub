"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useSupabase } from "@/context/supabase-provider";
import { useAuth } from "@/hooks/use-auth";
import { applyToJob, uploadCandidateResumePdf } from "@/lib/jobs/applications";
import { fetchPublicJobById, type PublicJobRow } from "@/lib/jobs/jobs";
import { Briefcase, CalendarDays, MapPin, Wallet } from "lucide-react";

function formatDate(input: string) {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function formatLocation(job: PublicJobRow) {
  return job.location?.trim() || job.locationType;
}

export default function ApplyToJobPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const supabase = useSupabase();
  const { isAuthenticated, loading: authLoading, accountType } = useAuth();

  const [job, setJob] = useState<PublicJobRow | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadJob() {
      setLoading(true);
      setError(null);

      try {
        const fetched = await fetchPublicJobById(supabase, jobId);
        if (!isCancelled) {
          setJob(fetched);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load this job.",
          );
          setJob(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadJob();

    return () => {
      isCancelled = true;
    };
  }, [jobId, supabase]);

  const canApply = useMemo(() => {
    return isAuthenticated && accountType === "candidate";
  }, [accountType, isAuthenticated]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!canApply) {
      setError("Please sign in with a candidate account to apply.");
      return;
    }

    setSubmitting(true);

    try {
      if (!resumeFile) {
        throw new Error("Please upload your resume as a PDF.");
      }

      const resumePath = await uploadCandidateResumePdf(
        supabase,
        jobId,
        resumeFile,
      );

      await applyToJob(supabase, {
        jobId,
        resume: resumePath,
        coverLetter,
      });
      setSuccess("Application submitted successfully.");
      setResumeFile(null);
      setCoverLetter("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit application.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="mx-auto w-full max-w-5xl px-6 py-8 sm:px-10 lg:py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="space-y-4">
              {job ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500"></span>
                      Active role
                    </Badge>
                    <Badge variant="secondary">{job.department}</Badge>
                    <Badge variant="secondary">{job.jobType}</Badge>
                  </div>
                  <div>
                    <CardTitle className="text-2xl tracking-tight">
                      {job.title}
                    </CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Review the details and submit your application from the
                      panel.
                    </p>
                  </div>
                </>
              ) : (
                <CardTitle>Apply for this job</CardTitle>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {job ? (
                <>
                  <div className="grid grid-cols-1 gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{job.jobType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{formatLocation(job)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span>Posted on {formatDate(job.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {job.salary || "Compensation shared during interview"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      Job Description
                    </h3>
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                        {job.description?.trim() ||
                          "Detailed job description will be shared by the recruiter."}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">
                    This job is not available right now. It may be closed or
                    removed.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="h-fit lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle>Application Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!authLoading && !isAuthenticated ? (
                <div className="space-y-3 rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">
                    Sign in as a candidate to apply for this role.
                  </p>
                  <Button asChild className="w-full">
                    <Link
                      href={`/auth/signin?redirect=${encodeURIComponent(`/jobs/${jobId}/apply`)}`}
                    >
                      Sign in to apply
                    </Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume (PDF)</Label>
                    <Input
                      id="resume"
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={(event) => {
                        const selected = event.target.files?.[0] ?? null;
                        setResumeFile(selected);
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Only PDF files are accepted.
                    </p>
                    {resumeFile ? (
                      <p className="text-xs text-foreground">
                        Selected: {resumeFile.name}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Cover Letter</Label>
                    <textarea
                      id="coverLetter"
                      value={coverLetter}
                      onChange={(event) => setCoverLetter(event.target.value)}
                      placeholder="Share why this role fits your experience"
                      className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>

                  {error ? (
                    <div className="rounded-md border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-500">
                      {error}
                    </div>
                  ) : null}

                  {success ? (
                    <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-500">
                      {success}
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting || !canApply || !job}
                  >
                    {submitting ? "Submitting..." : "Submit application"}
                  </Button>

                  {isAuthenticated && accountType !== "candidate" ? (
                    <p className="text-xs text-muted-foreground">
                      You are signed in as recruiter. Switch to a candidate
                      account to apply.
                    </p>
                  ) : null}
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
