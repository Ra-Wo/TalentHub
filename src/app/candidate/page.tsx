"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/context/supabase-provider";
import { useCandidateApplications } from "@/hooks/job-applications";
import { getUserProfile } from "@/lib/profile";
import { StatusBadge } from "@/components/feature/job-applications/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/helpers/format";
import { Briefcase, Building2, CalendarDays, CheckCircle2, Clock3, MapPin } from "lucide-react";

export default function CandidatePage() {
  const { user } = useAuth();
  const supabase = useSupabase();
  const { applications, isLoading: loading, error } = useCandidateApplications();

  const [displayName, setDisplayName] = useState("there");

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

  const totalApplied = applications.length;
  const reviewingCount = applications.filter(
    (application) => application.status === "reviewing",
  ).length;
  const acceptedCount = applications.filter(
    (application) => application.status === "accepted",
  ).length;

  return (
    <div className="space-y-6">
      <div className="border-border/70 bg-card/70 rounded-2xl border p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm">Candidate Dashboard</p>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground text-sm">
            Track your applications and stay updated on your hiring progress.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-border/70 bg-card/70 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Total Applications</p>
              <Briefcase className="text-muted-foreground h-4 w-4" />
            </div>
            <p className="text-foreground mt-3 text-3xl font-semibold">{totalApplied}</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/70 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">In Review</p>
              <Clock3 className="text-muted-foreground h-4 w-4" />
            </div>
            <p className="text-foreground mt-3 text-3xl font-semibold">{reviewingCount}</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/70 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Accepted</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-foreground mt-3 text-3xl font-semibold">{acceptedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-background/80 rounded-2xl shadow-xl backdrop-blur">
        <CardHeader className="border-border/70 border-b px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-foreground text-lg font-semibold">Applied Jobs</h2>
              <p className="text-muted-foreground mt-1 text-xs">Latest applications first</p>
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
            <div className="border-border rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground text-sm">
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
                    className="border-border/70 bg-card/50 hover:bg-card rounded-xl border p-4 transition-colors"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div>
                          <p className="text-foreground text-base font-semibold">{job.title}</p>
                          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
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
                          <p className="text-foreground/90 text-sm">{job.salary}</p>
                        ) : null}
                      </div>

                      <div className="flex flex-col items-start gap-2 lg:items-end">
                        <StatusBadge status={application.status} />
                        <p className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
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
