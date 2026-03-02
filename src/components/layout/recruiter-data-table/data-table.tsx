"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  departments?: string[];
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData extends { status: string; department: string }, TValue>({
  columns,
  data,
  departments = [],
  isLoading = false,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [deptFilter, setDeptFilter] = React.useState<string>("all");
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const departmentOptions = React.useMemo(() => {
    const uniqueDepartments = new Map<string, string>();

    for (const department of departments) {
      const normalizedDepartment = department.trim();
      if (!normalizedDepartment) continue;

      const key = normalizedDepartment.toLowerCase();
      if (!uniqueDepartments.has(key)) {
        uniqueDepartments.set(key, normalizedDepartment);
      }
    }

    return Array.from(uniqueDepartments.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [departments]);

  React.useEffect(() => {
    if (deptFilter === "all") return;
    const isValidDepartment = departmentOptions.some((option) => option.value === deptFilter);
    if (!isValidDepartment) setDeptFilter("all");
  }, [departmentOptions, deptFilter]);

  // Reset to first page whenever filters or data change
  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [statusFilter, deptFilter, data]);

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      const statusMatch =
        statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
      const deptMatch =
        deptFilter === "all" || item.department.toLowerCase() === deptFilter.toLowerCase();
      return statusMatch && deptMatch;
    });
  }, [data, statusFilter, deptFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });

  const pageCount = table.getPageCount();
  const showPaginationControls = pageCount > 1;

  return (
    <div className="bg-card border-border flex h-full flex-col overflow-hidden rounded-xl border shadow-sm">
      {/* Toolbar */}
      <div className="border-border bg-muted/20 flex flex-col justify-between gap-3 border-b p-4 lg:flex-row lg:items-center lg:gap-4">
        {/* Search */}
        <div className="relative w-full lg:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="text-muted-foreground h-4 w-4" />
          </div>
          <Input
            className="bg-background border-border focus:ring-primary focus:border-primary block h-10 w-full rounded-lg pr-3 pl-10 transition-colors focus:ring-1 sm:text-sm"
            placeholder="Search by job title..."
            type="text"
            onChange={(event) => {
              table.getColumn("title")?.setFilterValue(event.target.value);
            }}
          />
        </div>

        {/* Filters */}
        <div className="flex w-full gap-3 lg:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-full lg:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-10 w-full lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departmentOptions.map((department) => (
                <SelectItem key={department.value} value={department.value}>
                  {department.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30 rounded-2xl">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-muted-foreground h-11 px-4 text-[11px] font-semibold tracking-wide uppercase first:pl-6 last:pr-6"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, rowIndex) => (
                <TableRow key={`loading-row-${rowIndex}`}>
                  {columns.map((_, colIndex) => (
                    <TableCell
                      key={`loading-cell-${rowIndex}-${colIndex}`}
                      className="px-4 py-4 first:pl-6 last:pr-6"
                    >
                      <Skeleton
                        className={`h-4 ${
                          colIndex === 0
                            ? "w-52"
                            : colIndex === columns.length - 1
                              ? "w-24"
                              : "w-28"
                        }`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`group transition-colors ${onRowClick ? "hover:bg-accent/40 cursor-pointer" : ""}`}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className="px-4 py-4 align-middle first:pl-6 last:pr-6"
                      key={cell.id}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-44 text-center">
                  <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-2 px-4">
                    <div className="border-border bg-muted/40 rounded-full border p-3">
                      <Briefcase className="text-muted-foreground h-5 w-5" />
                    </div>
                    <p className="text-foreground text-sm font-medium">No jobs found</p>
                    <p className="text-muted-foreground text-xs">
                      Try changing filters or create a new job posting.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="border-border bg-muted/10 flex flex-col items-center justify-between gap-3 border-t p-4 sm:flex-row">
        {/* Row count + rows-per-page */}
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground text-sm">
            {filteredData.length === 0 ? (
              "No results"
            ) : (
              <>
                Showing{" "}
                <span className="text-foreground font-medium">
                  {pagination.pageIndex * pagination.pageSize + 1}
                </span>
                {"–"}
                <span className="text-foreground font-medium">
                  {Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredData.length)}
                </span>
                {" of "}
                <span className="text-foreground font-medium">{filteredData.length}</span>
                {" rows"}
              </>
            )}
          </p>
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) =>
              setPagination((prev) => ({
                ...prev,
                pageSize: Number(value),
                pageIndex: 0,
              }))
            }
          >
            <SelectTrigger className="h-8 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page navigation */}
        {showPaginationControls ? (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              title="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page number pills */}
            {Array.from({ length: pageCount }, (_, i) => i)
              .filter((page) => {
                const current = pagination.pageIndex;
                const total = pageCount;
                return page === 0 || page === total - 1 || Math.abs(page - current) <= 1;
              })
              .reduce<(number | "…")[]>((acc, page, idx, arr) => {
                if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) {
                  acc.push("…");
                }
                acc.push(page);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "…" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="text-muted-foreground px-1 text-sm select-none"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={item}
                    variant={pagination.pageIndex === item ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0 text-xs"
                    onClick={() => table.setPageIndex(item as number)}
                  >
                    {(item as number) + 1}
                  </Button>
                ),
              )}

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
              title="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
