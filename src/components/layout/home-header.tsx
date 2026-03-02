import Link from "next/link";
import Image from "next/image";

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
          <Image src="/icon.png" alt="TalentHub" width={36} height={36} className="rounded-md" />
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
