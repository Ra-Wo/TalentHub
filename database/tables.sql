-- CreateEnums
CREATE TYPE "JobStatus" AS ENUM ('Draft', 'Active', 'Closed');

CREATE TYPE "JobApplicationStatus" AS ENUM ('pending', 'reviewing', 'rejected', 'accepted');

-- CreateTable
CREATE TABLE
    "Profile" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "name" TEXT,
        "userid" TEXT NOT NULL,
        "profileImage" TEXT,
        "accountType" TEXT NOT NULL DEFAULT 'recruiter',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
    );

CREATE TABLE
    "Job" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "department" TEXT NOT NULL,
        "jobType" TEXT NOT NULL,
        "location" TEXT,
        "locationType" TEXT NOT NULL DEFAULT 'Remote',
        "salary" TEXT,
        "status" "JobStatus" NOT NULL DEFAULT 'Draft',
        "applicantCount" INTEGER NOT NULL DEFAULT 0,
        "recruiterId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "closedAt" TIMESTAMP(3),
        CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
    );

CREATE TABLE
    "JobApplication" (
        "id" TEXT NOT NULL,
        "jobId" TEXT NOT NULL,
        "candidateId" TEXT NOT NULL,
        "status" "JobApplicationStatus" NOT NULL DEFAULT 'pending',
        "resume" TEXT,
        "coverLetter" TEXT,
        "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "JobApplication_unique_application" UNIQUE ("jobId", "candidateId")
    );

-- CreateIndexs
CREATE INDEX "Profile_email_idx" ON "Profile" ("userid");

CREATE INDEX "Job_recruiterId_idx" ON "Job" ("recruiterId");

CREATE INDEX "Job_status_idx" ON "Job" ("status");

CREATE INDEX "Job_department_idx" ON "Job" ("department");

CREATE INDEX "JobApplication_jobId_idx" ON "JobApplication" ("jobId");

CREATE INDEX "JobApplication_candidateId_idx" ON "JobApplication" ("candidateId");

CREATE INDEX "JobApplication_status_idx" ON "JobApplication" ("status");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE;