"use client";

import { cn } from "@/lib/utils";
import { Briefcase, User } from "lucide-react";

type AccountType = "candidate" | "recruiter";

const ACCOUNT_TYPES = [
  {
    id: "candidate" as AccountType,
    icon: User,
    label: "Candidate",
    description: "Find opportunities",
  },
  {
    id: "recruiter" as AccountType,
    icon: Briefcase,
    label: "Recruiter",
    description: "Hire talent",
  },
];

interface AccountTypeSelectorProps {
  value: AccountType;
  onChange: (type: AccountType) => void;
  disabled?: boolean;
}

export function AccountTypeSelector({
  value,
  onChange,
  disabled = false,
}: AccountTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ACCOUNT_TYPES.map(({ id, icon: Icon, label, description }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          disabled={disabled}
          className={cn(
            "h-auto flex-col gap-2 p-3 text-sm border-border border rounded-lg cursor-pointer flex items-center transition-colors",
            value === id
              ? "border-primary/10 bg-accent/50 text-accent-foreground"
              : "hover:bg-accent/50 disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          <div className="rounded-full bg-muted p-1.5 w-fit">
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-center">
            <div className="font-medium">{label}</div>
            <div className="text-xs text-muted-foreground">{description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
