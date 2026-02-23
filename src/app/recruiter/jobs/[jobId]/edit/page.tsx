"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/context/supabase-provider";
import { getRecruiterJobById, updateRecruiterJob } from "@/lib/jobs-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

type JobFormState = {
  title: string;
  department: string;
  jobType: string;
  location: string;
  locationType: "Remote" | "On-site" | "Hybrid";
  salary: string;
  status: "Draft" | "Active" | "Closed";
  description: string;
};

const INITIAL_FORM: JobFormState = {
  title: "",
  department: "",
  jobType: "",
  location: "",
  locationType: "Remote",
  salary: "",
  status: "Draft",
  description: "",
};

export default function EditJobPage() {
  const { user } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();
  const params = useParams();

  const jobId = params.jobId as string;

  const [form, setForm] = useState<JobFormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const job = await getRecruiterJobById(supabase, jobId);
        setForm({
          title: job.title || "",
          department: job.department || "",
          jobType: job.jobType || "",
          location: job.location || "",
          locationType: job.locationType || "Remote",
          salary: job.salary || "",
          status: job.status || "Draft",
          description: job.description || "",
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load job. Please try again.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId, supabase]);

  const canSubmit = useMemo(() => {
    return Boolean(
      form.title.trim() && form.department.trim() && form.jobType.trim(),
    );
  }, [form]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!user?.id) {
      setError("Unable to identify recruiter account. Please sign in again.");
      return;
    }

    if (!canSubmit) {
      setError("Please fill in title, department, and job type.");
      return;
    }

    setSubmitting(true);

    try {
      await updateRecruiterJob(supabase, jobId, {
        ...form,
      });

      router.push("/recruiter");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update job. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Job</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update the job listing details.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/recruiter">Back</Link>
        </Button>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="e.g. Senior Frontend Engineer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Input
              id="department"
              value={form.department}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  department: event.target.value,
                }))
              }
              placeholder="e.g. Engineering"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobType">Job Type *</Label>
            <Input
              id="jobType"
              value={form.jobType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  jobType: event.target.value,
                }))
              }
              placeholder="e.g. Full-time"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  location: event.target.value,
                }))
              }
              placeholder="e.g. Bangalore"
            />
          </div>

          <div className="space-y-2">
            <Label>Location Type</Label>
            <Select
              value={form.locationType}
              onValueChange={(value: "Remote" | "On-site" | "Hybrid") =>
                setForm((current) => ({ ...current, locationType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="On-site">On-site</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Salary</Label>
            <Input
              id="salary"
              value={form.salary}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  salary: event.target.value,
                }))
              }
              placeholder="e.g. ₹18L - ₹24L"
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(value: "Draft" | "Active" | "Closed") =>
                setForm((current) => ({ ...current, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Job Description</Label>
            <textarea
              id="description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Describe role, responsibilities, and requirements..."
              className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/recruiter">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting || !canSubmit}>
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
