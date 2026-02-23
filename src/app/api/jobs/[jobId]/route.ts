import { createJobBodySchema } from "@/app/api/jobs/utils/schemas/jobs";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedRecruiterEmail, nullableTrimmed } from "../utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } },
) {
  try {
    const auth = await getAuthenticatedRecruiterEmail(request);
    if (!auth.ok) {
      return auth.response;
    }

    const { jobId } = params;
    const recruiterEmail = auth.recruiterEmail;

    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        recruiter: {
          email: recruiterEmail,
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or you don't have permission to access it" },
        { status: 404 },
      );
    }

    return NextResponse.json({ job });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { jobId: string } },
) {
  try {
    const auth = await getAuthenticatedRecruiterEmail(request);
    if (!auth.ok) {
      return auth.response;
    }

    const { jobId } = params;
    const recruiterEmail = auth.recruiterEmail;

    // Verify the recruiter owns this job
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        recruiter: {
          email: recruiterEmail,
        },
      },
      select: { id: true },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or you don't have permission to modify it" },
        { status: 404 },
      );
    }

    const bodyValidation = createJobBodySchema.safeParse(await request.json());

    if (!bodyValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: bodyValidation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { title, department, jobType, locationType, status } =
      bodyValidation.data;

    const description = nullableTrimmed(bodyValidation.data.description);
    const location = nullableTrimmed(bodyValidation.data.location);
    const salary = nullableTrimmed(bodyValidation.data.salary);

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        title,
        department,
        jobType,
        description: description || null,
        location: location || null,
        salary: salary || null,
        locationType,
        status,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({ job: updatedJob });
  } catch (error) {
    console.error("Error in PATCH /api/jobs/[jobId]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
