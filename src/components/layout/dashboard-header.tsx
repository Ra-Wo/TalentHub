"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Moon, Sun, ChevronDown, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // user data
  const userName = user?.user_metadata["full_name"] || "";
  const email = user?.email || "";
  const avatarUrl = user?.user_metadata["avatar_url"] || "";

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <svg
              aria-hidden="true"
              viewBox="0 0 48 48"
              className="h-6 w-6 text-primary"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="currentColor"
                opacity="0.2"
              />
              <circle cx="24" cy="24" r="12" fill="currentColor" />
              <circle cx="32" cy="16" r="4" fill="currentColor" opacity="0.9" />
            </svg>
          </div>
          <span className="font-semibold text-foreground">TalentAI</span>
        </Link>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 border-border/70 bg-background px-2"
              >
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary/15 text-primary font-semibold">
                    {userName}
                  </AvatarFallback>
                  <AvatarImage src={avatarUrl} alt={userName} />
                </Avatar>
                <span className="hidden max-w-45 truncate text-sm font-medium sm:block">
                  {userName}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="truncate">
                <div className="flex flex-col">
                  <span className="font-medium">{userName}</span>
                  <span className="text-xs text-muted-foreground">{email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="cursor-pointer"
              >
                {isDark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                {isDark ? "Light theme" : "Dark theme"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSignOut}
                variant="destructive"
                className="cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
