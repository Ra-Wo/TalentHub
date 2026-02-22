import Link from "next/link";

import ThemeToggle from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#solutions", label: "Solutions" },
  { href: "#pricing", label: "Pricing" },
  { href: "#about", label: "About" },
];

export function HomeHeader() {
  return (
    <header className="flex items-center justify-between gap-6 rounded-full border border-border/50 bg-background/70 px-6 py-3 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center">
          <svg
            aria-hidden="true"
            viewBox="0 0 48 48"
            className="h-9 w-9 text-primary"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="24" cy="24" r="20" fill="currentColor" opacity="0.2" />
            <circle cx="24" cy="24" r="12" fill="currentColor" />
            <circle cx="32" cy="16" r="4" fill="currentColor" opacity="0.9" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-foreground">TalentAI</span>
      </div>

      <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
        {navLinks.map((link) => (
          <a
            key={link.href}
            className="transition hover:text-foreground"
            href={link.href}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="rounded-full px-4 text-muted-foreground hover:text-foreground"
        >
          <Link href="/auth/signin">Login</Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Link href="/auth/signin">Get Started</Link>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
