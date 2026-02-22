"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DataTable } from "@/components/layout/recruiter-data-table/data-table";
import {
  columns,
  type Job,
} from "@/components/layout/recruiter-data-table/columns";
import { Plus, Briefcase, PieChart, Flame, ArrowUpDown } from "lucide-react";

const jobs: Job[] = [
  {
    id: 1,
    title: "Senior Product Designer",
    type: "Remote • Full-time",
    department: "Product",
    status: "Active",
    applicants: 45,
    extraApplicants: "+42",
    date: "Oct 24, 2023",
  },
  {
    id: 2,
    title: "Backend Engineer",
    type: "San Francisco • Hybrid",
    department: "Engineering",
    status: "Draft",
    applicants: 0,
    extraApplicants: null,
    date: "Oct 26, 2023",
  },
  {
    id: 3,
    title: "HR Specialist",
    type: "New York • On-site",
    department: "People Ops",
    status: "Closed",
    applicants: 120,
    extraApplicants: "+99",
    date: "Sep 12, 2023",
  },
  {
    id: 4,
    title: "Senior React Developer",
    type: "Remote • Contract",
    department: "Engineering",
    status: "Active",
    applicants: 156,
    extraApplicants: "Hot",
    date: "Oct 15, 2023",
  },
  {
    id: 5,
    title: "Marketing Manager",
    type: "London • Full-time",
    department: "Marketing",
    status: "Active",
    applicants: 28,
    extraApplicants: null,
    date: "Oct 28, 2023",
  },
];

export default function RecruiterPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <header className="shrink-0 z-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Breadcrumb className="mb-2">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Job Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Job Listings
            </h2>
          </div>
          <Button className="bg-primary">
            <Plus className="w-5 h-5" />
            Add New Job
          </Button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scroll-smooth pb-10">
        <div className="max-w-350 mx-auto space-y-6">
          {/* Insights Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Widget 1 */}
            <div className="bg-card rounded-xl p-5 border border-border shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Briefcase className="w-16 h-16 text-foreground" />
              </div>
              <div className="flex flex-col gap-1 relative z-10">
                <p className="text-muted-foreground text-sm font-medium">
                  Total Jobs
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-foreground">42</h3>
                  <span className="text-emerald-500 text-xs font-medium flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    <ArrowUpDown className="w-3 h-3 mr-0.5" /> +12%
                  </span>
                </div>
                <p className="text-muted-foreground text-xs mt-2">
                  All positions created this year
                </p>
              </div>
            </div>

            {/* Widget 2 */}
            <div className="bg-card rounded-xl p-5 border border-border shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <PieChart className="w-16 h-16 text-foreground" />
              </div>
              <div className="flex flex-col gap-1 relative z-10">
                <p className="text-muted-foreground text-sm font-medium">
                  Active vs Closed
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-2xl font-bold text-foreground">
                      12
                    </span>
                    <span className="text-xs text-emerald-500 font-medium">
                      Active
                    </span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-2xl font-bold text-muted-foreground">
                      30
                    </span>
                    <span className="text-xs text-red-500 font-medium">
                      Closed
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full mt-3 overflow-hidden flex">
                  <div className="h-full bg-emerald-500 w-[30%]"></div>
                  <div className="h-full bg-red-500 w-[70%]"></div>
                </div>
              </div>
            </div>

            {/* Widget 3 */}
            <div className="bg-card rounded-xl p-5 border border-border shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Flame className="w-16 h-16 text-foreground" />
              </div>
              <div className="flex flex-col gap-1 relative z-10">
                <p className="text-muted-foreground text-sm font-medium">
                  Most Applied Position
                </p>
                <h3 className="text-xl font-bold text-foreground mt-1 truncate">
                  Senior React Dev
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex -space-x-2">
                    <Image
                      width={24}
                      height={24}
                      alt="Applicant 1"
                      className="inline-block size-6 rounded-full ring-2 ring-card"
                      src="https://lh3.googleusercontent.com/a/ACg8ocKnVO3y6uIqf5HoRO7KJ6UMsdYeihJKTQX8L4h-aAPVeBJs9tCeBg=s96-c"
                    />
                    <Image
                      width={24}
                      height={24}
                      alt="Applicant 2"
                      className="inline-block size-6 rounded-full ring-2 ring-card"
                      src="https://lh3.googleusercontent.com/a/ACg8ocKnVO3y6uIqf5HoRO7KJ6UMsdYeihJKTQX8L4h-aAPVeBJs9tCeBg=s96-c"
                    />
                    <Image
                      width={24}
                      height={24}
                      alt="Applicant 3"
                      className="inline-block size-6 rounded-full ring-2 ring-card"
                      src="https://lh3.googleusercontent.com/a/ACg8ocKnVO3y6uIqf5HoRO7KJ6UMsdYeihJKTQX8L4h-aAPVeBJs9tCeBg=s96-c"
                    />
                  </div>
                  <span className="text-sm font-semibold text-blue-500">
                    156 Applicants
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Management Section */}
          <DataTable columns={columns} data={jobs} />
        </div>
      </div>
    </div>
  );
}
