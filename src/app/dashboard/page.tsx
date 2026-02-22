"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, TrendingUp, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSupabase } from "@/context/supabase-provider";
import { useEffect } from "react";

const stats = [
  {
    label: "Active Roles",
    value: "12",
    icon: Briefcase,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "Candidates",
    value: "248",
    icon: Users,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    label: "Placements",
    value: "34",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

const recentRoles = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "Tech Startup Inc",
    candidates: 24,
    status: "active",
  },
  {
    id: 2,
    title: "Product Manager",
    company: "Innovation Labs",
    candidates: 18,
    status: "active",
  },
  {
    id: 3,
    title: "UX Designer",
    company: "Design Studio Co",
    candidates: 12,
    status: "closed",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const supabase = useSupabase();

  useEffect(() => {
    // TODO: Add your supabase logic here
  }, [supabase]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">
          Welcome back, {user?.email?.split("@")[0]}
        </h1>
        <p className="text-muted-foreground">
          Here{"'"}s what{"'"}s happening with your hiring pipeline today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="rounded-2xl border-border/60 bg-background/80 shadow-xl backdrop-blur"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-lg ${stat.bg} p-3`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-border/60 bg-background/80 shadow-xl backdrop-blur">
            <CardHeader className="border-b border-border/70 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Recent Roles
                </h2>
                <Link href="/dashboard/roles">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/70">
                {recentRoles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between gap-4 border-border/70 px-6 py-4 hover:bg-muted/30 transition"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {role.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {role.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {role.candidates}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Candidates
                        </p>
                      </div>
                      <Badge
                        variant={
                          role.status === "active" ? "default" : "outline"
                        }
                        className="rounded-full"
                      >
                        {role.status === "active" ? "Active" : "Closed"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="rounded-2xl border-border/60 bg-background/80 shadow-xl backdrop-blur">
            <CardHeader className="px-6 py-4">
              <h3 className="font-semibold text-foreground">Quick Actions</h3>
            </CardHeader>
            <CardContent className="space-y-3 px-6 pb-6">
              <Link href="/dashboard/roles/new" className="block">
                <Button className="w-full gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  New Role
                </Button>
              </Link>
              <Button variant="outline" className="w-full gap-2 rounded-lg">
                <Users className="h-4 w-4" />
                Add Candidate
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/60 bg-background/80 shadow-xl backdrop-blur">
            <CardHeader className="px-6 py-4">
              <h3 className="font-semibold text-foreground">Tips</h3>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6 text-sm">
              <div>
                <p className="font-medium text-foreground">
                  Use AI-powered matching
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Let TalentAI match candidates automatically with your roles.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Schedule interviews
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Coordinate with your team using integrated scheduling.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
