import { HomeHeader } from "@/components/layout/home-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Meteors } from "@/components/ui/meteors";
import { Briefcase, User } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-background relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <Meteors number={24} />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 pt-6 pb-20 sm:px-10">
        <HomeHeader />

        <main className="mt-16 flex flex-col items-center text-center">
          <Badge
            variant="outline"
            className="border-border/60 bg-background/80 text-muted-foreground rounded-full px-4 py-1 text-[0.65rem] font-semibold tracking-[0.22em] uppercase"
          >
            Now with GPT-4 Integration
          </Badge>
          <h1 className="text-foreground mt-6 max-w-3xl text-4xl leading-tight font-extrabold sm:text-5xl">
            Find the Right Talent,
            <span className="text-primary block">Faster with AI</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-7 sm:text-lg">
            Our proprietary algorithms analyze millions of data points to match top companies with
            the perfect candidates in seconds, not weeks.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
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

          <Card className="border-border/70 bg-background/80 mt-14 w-full max-w-4xl rounded-3xl shadow-xl backdrop-blur">
            <CardContent className="p-0">
              <div className="border-border/70 flex items-center gap-2 border-b px-6 py-4">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="grid gap-6 p-6 md:grid-cols-[1fr_1.4fr]">
                <div className="bg-muted/60 space-y-4 rounded-2xl p-4">
                  <div className="bg-muted h-8 w-20 rounded-lg" />
                  <div className="space-y-2">
                    <div className="bg-muted h-3 w-32 rounded-full" />
                    <div className="bg-muted h-3 w-24 rounded-full" />
                    <div className="bg-muted h-3 w-28 rounded-full" />
                  </div>
                  <div className="bg-muted h-10 rounded-xl" />
                </div>
                <div className="space-y-4">
                  <div className="border-border/60 bg-background flex items-center justify-between rounded-2xl border px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/20 h-10 w-10 rounded-full" />
                      <div>
                        <div className="bg-muted h-3 w-24 rounded-full" />
                        <div className="bg-muted mt-2 h-3 w-32 rounded-full" />
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary rounded-full">98% Match</Badge>
                  </div>
                  <div className="border-border/60 bg-background flex items-center justify-between rounded-2xl border px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted h-10 w-10 rounded-full" />
                      <div>
                        <div className="bg-muted h-3 w-24 rounded-full" />
                        <div className="bg-muted mt-2 h-3 w-32 rounded-full" />
                      </div>
                    </div>
                    <Badge className="bg-secondary text-secondary-foreground rounded-full">
                      85% Match
                    </Badge>
                  </div>
                  <div className="border-border/70 bg-muted/60 text-muted-foreground rounded-2xl border border-dashed px-4 py-6 text-left text-sm">
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
