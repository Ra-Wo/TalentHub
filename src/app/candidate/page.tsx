"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CandidatePage() {
  const { user } = useAuth();
  const displayName = user?.email?.split("@")[0] ?? "there";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">
          Welcome back, {displayName}
        </h1>
        <p className="text-muted-foreground">Candidate dashboard</p>
      </div>

      <Card className="rounded-2xl border-border/60 bg-background/80 shadow-xl backdrop-blur">
        <CardHeader className="border-b border-border/70 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Overview</h2>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Add candidate widgets and data sections here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
