"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpDown,
  Pencil,
  Copy,
  Link2,
  Archive,
  Trash2,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Job = {
  id: string;
  title: string;
  type: string;
  department: string;
  status: "Active" | "Draft" | "Closed";
  applicants: number;
  extraApplicants: string | null;
  date: string;
};

type JobActionHandlers = {
  onCloseJob?: (jobId: string) => Promise<void> | void;
  onReopenJob?: (jobId: string) => Promise<void> | void;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
        >
          <span className="size-1.5 rounded-full bg-emerald-500"></span>
          Active
        </Badge>
      );
    case "Closed":
      return (
        <Badge variant="outline" className="gap-1 border-red-500/20 bg-red-500/10 text-red-500">
          <span className="size-1.5 rounded-full bg-red-500"></span>
          Closed
        </Badge>
      );
    case "Draft":
      return (
        <Badge variant="outline" className="gap-1">
          <span className="bg-muted-foreground size-1.5 rounded-full"></span>
          Draft
        </Badge>
      );
    default:
      return null;
  }
};

function JobActionsDropdown({
  job,
  onCloseJob,
  onReopenJob,
}: {
  job: Job;
  onCloseJob?: (jobId: string) => Promise<void> | void;
  onReopenJob?: (jobId: string) => Promise<void> | void;
}) {
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const applyLink = `/jobs/${job.id}/apply`;

  const handleCopyApplyLink = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const fullApplyLink = `${origin}${applyLink}`;

    try {
      await navigator.clipboard.writeText(fullApplyLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleCloseJob = async () => {
    if (!onCloseJob || isUpdating) return;

    setIsUpdating(true);
    try {
      await onCloseJob(job.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReopenJob = async () => {
    if (!onReopenJob || isUpdating) return;

    setIsUpdating(true);
    try {
      await onReopenJob(job.id);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
          title="Actions"
          aria-label="Actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {job.status === "Closed" ? (
          <DropdownMenuItem onSelect={handleReopenJob} disabled={!onReopenJob || isUpdating}>
            <RefreshCw className={`h-4 w-4 ${isUpdating ? "animate-spin" : ""}`} />
            Reopen Job
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href={`/recruiter/jobs/${job.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit Job
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href={applyLink} target="_blank">
            <Link2 className="h-4 w-4" />
            Open Apply Link
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={handleCopyApplyLink}>
          <Copy className="h-4 w-4" />
          {copied ? "Copied" : "Copy Apply Link"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {job.status === "Draft" ? (
          <DropdownMenuItem variant="destructive">
            <Trash2 className="h-4 w-4" />
            Delete Draft
          </DropdownMenuItem>
        ) : job.status === "Closed" ? (
          <DropdownMenuItem variant="destructive">
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            variant="destructive"
            onSelect={handleCloseJob}
            disabled={!onCloseJob || isUpdating}
          >
            <Archive className="h-4 w-4" />
            Close Job
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function getColumns(actions: JobActionHandlers = {}): ColumnDef<Job>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center select-none"
        >
          Job Title
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </div>
      ),
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex max-w-88 items-center">
            <div className="space-y-0.5">
              <div className="text-foreground truncate text-sm leading-none font-semibold">
                {job.title}
              </div>
              <div className="text-muted-foreground truncate text-xs leading-none">{job.type}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <div className="text-foreground/85 text-sm font-medium">{row.getValue("department")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("status") as string),
    },
    {
      accessorKey: "applicants",
      header: ({ column }) => (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex cursor-pointer items-center select-none"
        >
          Applicants
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </div>
      ),
      cell: ({ row }) => {
        const job = row.original;
        return job.applicants > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-foreground text-sm font-semibold">{job.applicants}</span>
            {job.extraApplicants && (
              <div className="flex -space-x-1">
                {job.extraApplicants === "Hot" ? (
                  <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-500">
                    Hot
                  </span>
                ) : (
                  <>
                    <div className="bg-muted ring-card size-5 rounded-full ring-2"></div>
                    <div className="bg-muted-foreground/50 ring-card size-5 rounded-full ring-2"></div>
                    <div className="bg-muted-foreground ring-card text-background flex size-5 items-center justify-center rounded-full text-[8px] font-bold ring-2">
                      {job.extraApplicants}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm italic">No applicants</span>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Created Date",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm font-medium">{row.getValue("date")}</div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-muted-foreground text-right">Actions</div>,
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div
            className="flex items-center justify-end gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            <JobActionsDropdown
              job={job}
              onCloseJob={actions.onCloseJob}
              onReopenJob={actions.onReopenJob}
            />
          </div>
        );
      },
    },
  ];
}
