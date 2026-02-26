"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/context/supabase-provider";
import { getUserProfile } from "@/lib/user-profile";
import {
  fetchCandidateApplications,
  type CandidateApplicationRow,
} from "@/lib/jobs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
} from "lucide-react";

function formatDate(input: string) {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getStatusBadge(status: CandidateApplicationRow["status"]) {
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

export default function CandidatePage() {
  const { user } = useAuth();
  const supabase = useSupabase();

  const [applications, setApplications] = useState<CandidateApplicationRow[]>(
    [],
  );
  const [displayName, setDisplayName] = useState("there");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfileName() {
      if (!user?.id) {
        if (!cancelled) {
          setDisplayName("there");
        }
        return;
      }

      try {
        const profile = await getUserProfile(supabase, user.id);
        if (!cancelled) {
          const profileName = profile.name?.trim();
          if (profileName) {
            setDisplayName(profileName);
            return;
          }

          const metadataName = user.user_metadata?.full_name;
          if (typeof metadataName === "string" && metadataName.trim()) {
            setDisplayName(metadataName.trim());
            return;
          }

          setDisplayName(user.email?.split("@")[0] ?? "there");
        }
      } catch {
        if (!cancelled) {
          const metadataName = user.user_metadata?.full_name;
          if (typeof metadataName === "string" && metadataName.trim()) {
            setDisplayName(metadataName.trim());
            return;
          }

          setDisplayName(user.email?.split("@")[0] ?? "there");
        }
      }
    }

    void loadProfileName();

    return () => {
      cancelled = true;
    };
  }, [supabase, user]);

  useEffect(() => {
    let cancelled = false;

    async function loadApplications() {
      setLoading(true);
      setError(null);

      try {
        const rows = await fetchCandidateApplications(supabase);
        if (!cancelled) {
          setApplications(rows.filter((row) => row.job));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load applications.",
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

  const totalApplied = applications.length;
  const reviewingCount = applications.filter(
    (application) => application.status === "reviewing",
  ).length;
  const acceptedCount = applications.filter(
    (application) => application.status === "accepted",
  ).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Candidate Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your applications and stay updated on your hiring progress.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-border/70 bg-card/70 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Total Applications
              </p>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-foreground">
              {totalApplied}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/70 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">In Review</p>
              <Clock3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-foreground">
              {reviewingCount}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/70 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Accepted</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-foreground">
              {acceptedCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/60 bg-background/80 shadow-xl backdrop-blur">
        <CardHeader className="border-b border-border/70 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Applied Jobs
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Latest applications first
              </p>
            </div>
            <Badge variant="outline">{totalApplied} Total</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                You haven&apos;t applied to any jobs yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => {
                const job = application.job;
                const location = job.location?.trim() || job.locationType;

                return (
                  <div
                    key={application.id}
                    className="rounded-xl border border-border/70 bg-card/50 p-4 transition-colors hover:bg-card"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div>
                          <p className="text-base font-semibold text-foreground">
                            {job.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5" />
                              {job.department}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Briefcase className="h-3.5 w-3.5" />
                              {job.jobType}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {location}
                            </span>
                          </div>
                        </div>

                        {job.salary ? (
                          <p className="text-sm text-foreground/90">
                            {job.salary}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-col items-start gap-2 lg:items-end">
                        {getStatusBadge(application.status)}
                        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Applied on {formatDate(application.appliedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
