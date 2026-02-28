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
    <header className="border-border/50 bg-background/70 flex items-center justify-between gap-6 rounded-full border px-6 py-3 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center">
          <svg
            aria-hidden="true"
            viewBox="0 0 48 48"
            className="text-primary h-9 w-9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="24" cy="24" r="20" fill="currentColor" opacity="0.2" />
            <circle cx="24" cy="24" r="12" fill="currentColor" />
            <circle cx="32" cy="16" r="4" fill="currentColor" opacity="0.9" />
          </svg>
        </div>
        <span className="text-foreground text-sm font-semibold">TalentHub</span>
      </div>

      <nav className="text-muted-foreground hidden items-center gap-6 text-sm font-medium md:flex">
        {navLinks.map((link) => (
          <a key={link.href} className="hover:text-foreground transition" href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground rounded-full px-4"
        >
          <Link href="/auth/signin">Login</Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
        >
          <Link href="/auth/signin">Get Started</Link>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
