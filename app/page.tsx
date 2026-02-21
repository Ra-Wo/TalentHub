import { HomeHeader } from "@/components/home-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Meteors } from "@/components/ui/meteors";
import { Briefcase, User } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <Meteors number={24} />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-20 pt-6 sm:px-10">
        <HomeHeader />

        <main className="mt-16 flex flex-col items-center text-center">
          <Badge
            variant="outline"
            className="rounded-full border-border/60 bg-background/80 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
          >
            Now with GPT-4 Integration
          </Badge>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
            Find the Right Talent,
            <span className="block text-primary">Faster with AI</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Our proprietary algorithms analyze millions of data points to match
            top companies with the perfect candidates in seconds, not weeks.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
              size="lg"
            >
              <Briefcase className="h-4 w-4" />
              Post a Job
            </Button>
            <Button variant="outline" className="rounded-full px-6" size="lg">
              <User className="h-4 w-4" />
              Apply as Candidate
            </Button>
          </div>

          <Card className="mt-14 w-full max-w-4xl rounded-3xl border-border/70 bg-background/80 shadow-xl backdrop-blur">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 border-b border-border/70 px-6 py-4">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="grid gap-6 p-6 md:grid-cols-[1fr_1.4fr]">
                <div className="space-y-4 rounded-2xl bg-muted/60 p-4">
                  <div className="h-8 w-20 rounded-lg bg-muted" />
                  <div className="space-y-2">
                    <div className="h-3 w-32 rounded-full bg-muted" />
                    <div className="h-3 w-24 rounded-full bg-muted" />
                    <div className="h-3 w-28 rounded-full bg-muted" />
                  </div>
                  <div className="h-10 rounded-xl bg-muted" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20" />
                      <div>
                        <div className="h-3 w-24 rounded-full bg-muted" />
                        <div className="mt-2 h-3 w-32 rounded-full bg-muted" />
                      </div>
                    </div>
                    <Badge className="rounded-full bg-primary/10 text-primary">
                      98% Match
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted" />
                      <div>
                        <div className="h-3 w-24 rounded-full bg-muted" />
                        <div className="mt-2 h-3 w-32 rounded-full bg-muted" />
                      </div>
                    </div>
                    <Badge className="rounded-full bg-secondary text-secondary-foreground">
                      85% Match
                    </Badge>
                  </div>
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/60 px-4 py-6 text-left text-sm text-muted-foreground">
                    120+ candidate profiles auto-ranked based on your role fit.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
