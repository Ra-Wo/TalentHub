"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useSupabase } from "@/context/supabase-provider";
import {
  fetchRecruiterApplications,
  type RecruiterApplicationRow,
} from "@/lib/jobs";

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

export default function RecruiterApplicationsPage() {
  const supabase = useSupabase();

  const [applications, setApplications] = useState<RecruiterApplicationRow[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadApplications() {
      setLoading(true);
      setError(null);

      try {
        const rows = await fetchRecruiterApplications(supabase);
        if (!cancelled) {
          setApplications(rows);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load recruiter applications.",
          );
          setApplications([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadApplications();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

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
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="rounded-xl border border-border/70 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-foreground">
                        {application.job.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {application.job.department} • {application.job.jobType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Candidate: {maskCandidateId(application.candidateId)}
                      </p>
                      {application.coverLetter ? (
                        <p className="text-sm text-foreground/85 mt-2 line-clamp-2">
                          {application.coverLetter}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                      {getStatusBadge(application.status)}
                      <p className="text-xs text-muted-foreground">
                        Applied on {formatDate(application.appliedAt)}
                      </p>
                      {application.resume ? (
                        <p className="text-xs text-muted-foreground max-w-48 truncate">
                          Resume: {application.resume}
                        </p>
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
