"use client";

import { useAuth } from "@/hooks/use-auth";
import { getAccountTypeRoute } from "@/lib/helpers/routes";
import { useSupabase } from "@/context/supabase-provider";
import { getUserProfile, type UserProfile } from "@/lib/profile";
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
import { Moon, Sun, ChevronDown, LogOut, Settings, ArrowRightLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function DashboardHeader() {
  const { user, signOut, accountType, switchAccountType } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // user data
  const rawFullName = user?.user_metadata["full_name"];
  const rawName = user?.user_metadata["name"];
  const userName =
    profile?.name ||
    (typeof rawFullName === "string" && rawFullName.trim()) ||
    (typeof rawName === "string" && rawName.trim()) ||
    (user?.email?.split("@")[0] ?? "Account");
  const email = profile?.email || user?.email || "";
  const avatarUrl =
    profile?.profileImage ||
    (typeof user?.user_metadata["avatar_url"] === "string" ? user.user_metadata["avatar_url"] : "");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!user?.id) {
        setProfile(null);
        return;
      }

      try {
        const data = await getUserProfile(supabase, user.id);
        if (!cancelled) {
          setProfile(data);
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [supabase, user?.id]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleSwitchAccount = async () => {
    if (!accountType) return;

    const nextAccountType = accountType === "recruiter" ? "candidate" : "recruiter";

    await switchAccountType(nextAccountType);
    router.push(getAccountTypeRoute(nextAccountType));
    router.refresh();
  };

  return (
    <header className="border-border/70 bg-background/80 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg">
            <svg
              aria-hidden="true"
              viewBox="0 0 48 48"
              className="text-primary h-6 w-6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="24" cy="24" r="20" fill="currentColor" opacity="0.2" />
              <circle cx="24" cy="24" r="12" fill="currentColor" />
              <circle cx="32" cy="16" r="4" fill="currentColor" opacity="0.9" />
            </svg>
          </div>
          <span className="text-foreground font-semibold">TalentHub</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-border/70 bg-background h-10 px-2">
                  <Avatar size="sm">
                    <AvatarFallback className="bg-primary/15 text-primary font-semibold">
                      {userName.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                    <AvatarImage src={avatarUrl} alt={userName} />
                  </Avatar>
                  <span className="hidden max-w-45 truncate text-sm font-medium sm:block">
                    {userName}
                  </span>
                  <ChevronDown className="text-muted-foreground h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="truncate">
                  <div className="flex flex-col">
                    <span className="font-medium">{userName}</span>
                    <span className="text-muted-foreground text-xs">{email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSwitchAccount} className="cursor-pointer">
                  <ArrowRightLeft className="h-4 w-4" />
                  {accountType === "recruiter" ? "Switch to Candidate" : "Switch to Recruiter"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="cursor-pointer"
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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
          ) : (
            <Button asChild>
              <Link href="/auth/signin">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
