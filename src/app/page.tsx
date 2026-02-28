import Link from "next/link";
import { HomeHeader } from "@/components/layout/home-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Meteors } from "@/components/ui/meteors";
import {
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-background relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 hidden dark:block">
        <Meteors number={24} />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 pt-6 pb-20 sm:px-10">
        <HomeHeader />

        <main className="mt-14 space-y-16">
          <section className="flex flex-col items-center text-center">
            <Badge
              variant="outline"
              className="border-border/60 bg-background/80 text-muted-foreground rounded-full px-4 py-1 text-[0.65rem] font-semibold tracking-[0.22em] uppercase"
            >
              Built for Modern Hiring Teams
            </Badge>

            <h1 className="text-foreground mt-6 max-w-4xl text-4xl leading-tight font-extrabold sm:text-5xl lg:text-6xl">
              Hire faster with a workflow your team can trust.
            </h1>

            <p className="text-muted-foreground mt-5 max-w-2xl text-base leading-7 sm:text-lg">
              TalentHub gives recruiters and candidates one clear place to manage applications,
              track progress, and make faster hiring decisions.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
                size="lg"
              >
                <Link href="/auth/signin">
                  <Briefcase className="h-4 w-4" />
                  Start Hiring
                </Link>
              </Button>

              <Button asChild variant="outline" className="rounded-full px-6" size="lg">
                <Link href="/auth/signup">
                  <User className="h-4 w-4" />
                  Create Candidate Account
                </Link>
              </Button>
            </div>

            <div className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
              <Card className="border-border/60 bg-background/80">
                <CardContent className="p-4 text-left">
                  <p className="text-foreground text-2xl font-bold">500+</p>
                  <p className="text-muted-foreground mt-1 text-sm">Active hiring teams</p>
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-background/80">
                <CardContent className="p-4 text-left">
                  <p className="text-foreground text-2xl font-bold">50k+</p>
                  <p className="text-muted-foreground mt-1 text-sm">Applications reviewed</p>
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-background/80">
                <CardContent className="p-4 text-left">
                  <p className="text-foreground text-2xl font-bold">40%</p>
                  <p className="text-muted-foreground mt-1 text-sm">Faster hiring cycles</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="features" className="space-y-6">
            <div className="text-center">
              <p className="text-primary text-sm font-semibold tracking-wide uppercase">Features</p>
              <h2 className="text-foreground mt-2 text-3xl font-bold tracking-tight">
                Everything you need to run hiring in one place
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-border/70">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <Briefcase className="text-primary h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">Job Management</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-6">
                    Create, edit, and publish roles with clear status tracking for every opening.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/70">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <FileText className="text-primary h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">Application Tracking</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-6">
                    Review applications by role, monitor statuses, and keep your pipeline organized.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/70">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <BarChart3 className="text-primary h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">Hiring Visibility</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-6">
                    See candidate flow and hiring progress with simple recruiter-focused dashboards.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="solutions" className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/70">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="text-primary h-5 w-5" />
                  <h3 className="text-xl font-semibold">For Recruiters</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm leading-6">
                  Move from job posting to offer with less friction and clearer collaboration.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4" />
                    Manage all job applications from a single recruiter workspace
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4" />
                    Review candidate details, resumes, and cover letters quickly
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4" />
                    Keep hiring teams aligned with clear status updates
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="text-primary h-5 w-5" />
                  <h3 className="text-xl font-semibold">For Candidates</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm leading-6">
                  Apply with confidence and keep track of opportunities in one place.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4" />
                    Submit applications with resume and cover letter in minutes
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4" />
                    Track each application stage from pending to final decision
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4" />
                    Use one account to manage all active applications
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          <section id="pricing" className="space-y-6">
            <div className="text-center">
              <p className="text-primary text-sm font-semibold tracking-wide uppercase">Pricing</p>
              <h2 className="text-foreground mt-2 text-3xl font-bold tracking-tight">
                Flexible plans for every hiring stage
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-border/70">
                <CardHeader>
                  <h3 className="text-xl font-semibold">Starter</h3>
                  <p className="text-muted-foreground text-sm">For small teams beginning to hire</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-foreground text-2xl font-bold">$29/mo</p>
                  <p className="text-muted-foreground text-sm">Up to 3 active job postings</p>
                </CardContent>
              </Card>

              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <Badge className="w-fit rounded-full">Most Popular</Badge>
                  <h3 className="text-xl font-semibold">Growth</h3>
                  <p className="text-muted-foreground text-sm">For scaling hiring teams</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-foreground text-2xl font-bold">$99/mo</p>
                  <p className="text-muted-foreground text-sm">
                    Unlimited jobs and full pipeline view
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/70">
                <CardHeader>
                  <h3 className="text-xl font-semibold">Enterprise</h3>
                  <p className="text-muted-foreground text-sm">
                    For high-volume recruiting operations
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-foreground text-2xl font-bold">Custom</p>
                  <p className="text-muted-foreground text-sm">
                    Advanced controls and priority support
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="about" className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <Card className="border-border/70">
              <CardHeader>
                <h3 className="text-2xl font-semibold">Why teams choose TalentHub</h3>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground leading-6">
                  TalentHub is built for practical hiring execution: clear workflows, fast review,
                  and transparent candidate progress.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="border-border/60 rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Clock3 className="text-primary h-4 w-4" />
                      <p className="font-medium">Save Time</p>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Reduce manual follow-up with a centralized process.
                    </p>
                  </div>
                  <div className="border-border/60 rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="text-primary h-4 w-4" />
                      <p className="font-medium">Stay Secure</p>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Access controls and data policies designed for hiring teams.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="flex h-full flex-col justify-between gap-6 p-6">
                <div className="space-y-2">
                  <p className="text-primary text-sm font-semibold tracking-wide uppercase">
                    Ready to start?
                  </p>
                  <h3 className="text-foreground text-2xl font-bold">
                    Launch your hiring workflow today.
                  </h3>
                  <p className="text-muted-foreground text-sm leading-6">
                    Set up your account, post your first role, and manage applications with one
                    consistent process.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild className="rounded-full px-5">
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full px-5">
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>

        <footer className="border-border/70 mt-16 border-t py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-foreground text-base font-semibold">TalentHub</p>
              <p className="text-muted-foreground mt-1 text-sm">
                A focused hiring platform for recruiters and candidates.
              </p>
            </div>

            <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
              <a href="#features" className="hover:text-foreground transition">
                Features
              </a>
              <a href="#solutions" className="hover:text-foreground transition">
                Solutions
              </a>
              <a href="#pricing" className="hover:text-foreground transition">
                Pricing
              </a>
              <a href="#about" className="hover:text-foreground transition">
                About
              </a>
              <Link href="/auth/signin" className="hover:text-foreground transition">
                Sign In
              </Link>
            </div>
          </div>

          <div className="text-muted-foreground mt-6 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} TalentHub. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <Link href="/auth/signin" className="hover:text-foreground transition">
                Terms
              </Link>
              <Link href="/auth/signin" className="hover:text-foreground transition">
                Privacy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
