"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Pencil,
  Copy,
  Archive,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Job = {
  id: number;
  title: string;
  type: string;
  department: string;
  status: "Active" | "Draft" | "Closed";
  applicants: number;
  extraApplicants: string | null;
  date: string;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1"
        >
          <span className="size-1.5 rounded-full bg-emerald-500"></span>
          Active
        </Badge>
      );
    case "Closed":
      return (
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-500 border-red-500/20 gap-1"
        >
          <span className="size-1.5 rounded-full bg-red-500"></span>
          Closed
        </Badge>
      );
    case "Draft":
      return (
        <Badge variant="outline" className="gap-1">
          <span className="size-1.5 rounded-full bg-muted-foreground"></span>
          Draft
        </Badge>
      );
    default:
      return null;
  }
};

export const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="p-0"
      >
        Job Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const job = row.original;
      return (
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-foreground">
              {job.title}
            </div>
            <div className="text-xs text-muted-foreground">{job.type}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <div className="text-sm text-foreground/80">
        {row.getValue("department")}
      </div>
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
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="p-0"
      >
        Applicants
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const job = row.original;
      return job.applicants > 0 ? (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {job.applicants}
          </span>
          {job.extraApplicants && (
            <div className="flex -space-x-1">
              {job.extraApplicants === "Hot" ? (
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500 text-[10px] font-bold">
                  Hot
                </span>
              ) : (
                <>
                  <div className="size-5 rounded-full bg-muted ring-2 ring-card"></div>
                  <div className="size-5 rounded-full bg-muted-foreground/50 ring-2 ring-card"></div>
                  <div className="size-5 rounded-full bg-muted-foreground ring-2 ring-card flex items-center justify-center text-[8px] text-background font-bold">
                    {job.extraApplicants}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground italic">
          No applicants
        </span>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Created Date",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.getValue("date")}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const job = row.original;
      return (
        <div className="flex items-center justify-end gap-2">
          {job.status === "Closed" ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Reopen"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </Button>
          {job.status === "Draft" ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:text-red-500"
              title="Delete Draft"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          ) : job.status === "Closed" ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:text-red-500"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:text-red-500"
              title="Close Job"
            >
              <Archive className="w-4 h-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
