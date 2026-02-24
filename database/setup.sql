-- CreateEnums
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE "JobStatus" AS ENUM ('Draft', 'Active', 'Closed');

CREATE TYPE "JobApplicationStatus" AS ENUM ('pending', 'reviewing', 'rejected', 'accepted');

-- CreateTable
CREATE TABLE
    "Profile" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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

-- CreateTrigger
CREATE OR REPLACE FUNCTION update_job_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "update_job_updated_at_trigger"
BEFORE UPDATE ON "Job"
FOR EACH ROW
EXECUTE FUNCTION update_job_updated_at();

CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "update_profile_updated_at_trigger"
BEFORE UPDATE ON "Profile"
FOR EACH ROW
EXECUTE FUNCTION update_profile_updated_at();

CREATE OR REPLACE FUNCTION update_job_application_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."appliedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "update_job_application_updated_at_trigger"
BEFORE UPDATE ON "JobApplication"
FOR EACH ROW
EXECUTE FUNCTION update_job_application_updated_at();

-- Enable RLS (Supabase)
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JobApplication" ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (Supabase)
CREATE POLICY "Allow recruiters to manage their own jobs" ON "Job"
FOR ALL
TO public
USING ("recruiterId" = auth.uid()::text);

CREATE POLICY "Allow candidates to view active jobs" ON "Job"
FOR SELECT
TO public
USING ("status" = 'Active');

CREATE POLICY "Allow candidates to apply for active jobs" ON "JobApplication"
FOR INSERT
TO public
WITH CHECK (EXISTS (SELECT 1 FROM "Job" WHERE "Job"."id" = "JobApplication"."jobId" AND "Job"."status" = 'Active'));

CREATE POLICY "Allow candidates to manage their own applications" ON "JobApplication"
FOR ALL
TO public
USING ("candidateId" = auth.uid()::text);

CREATE POLICY "Allow recruiters to view applications for their jobs" ON "JobApplication"
FOR SELECT
TO public
USING (EXISTS (SELECT 1 FROM "Job" WHERE "Job"."id" = "JobApplication"."jobId" AND "Job"."recruiterId" = auth.uid()::text));

CREATE POLICY "Allow users to manage their own profile" ON "Profile"
FOR ALL
TO public
USING ("id" = auth.uid()::text);

-- Grant privileges for Supabase API roles
GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;
GRANT USAGE ON TYPE "JobStatus" TO authenticated, service_role;
GRANT USAGE ON TYPE "JobApplicationStatus" TO authenticated, service_role;

-- Set default privileges for future objects created in the public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT EXECUTE ON FUNCTIONS TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE ON TYPES TO authenticated, service_role;
