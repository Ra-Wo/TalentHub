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
    "Department" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "name" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Department_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Department_name_key" UNIQUE ("name")
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
        "jobApplicationCount" INTEGER NOT NULL DEFAULT 0,
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

CREATE INDEX "Department_name_idx" ON "Department" ("name");

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

CREATE OR REPLACE FUNCTION update_department_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "update_department_updated_at_trigger"
BEFORE UPDATE ON "Department"
FOR EACH ROW
EXECUTE FUNCTION update_department_updated_at();

CREATE OR REPLACE FUNCTION sync_department_from_job()
RETURNS TRIGGER AS $$
DECLARE
    normalized_department TEXT;
BEGIN
    normalized_department := TRIM(NEW."department");

    IF normalized_department <> '' THEN
        INSERT INTO "Department" ("name", "updatedAt")
        VALUES (normalized_department, CURRENT_TIMESTAMP)
        ON CONFLICT ("name") DO UPDATE
        SET "updatedAt" = CURRENT_TIMESTAMP;
    END IF;

    NEW."department" = normalized_department;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER "sync_department_from_job_trigger"
BEFORE INSERT OR UPDATE OF "department" ON "Job"
FOR EACH ROW
EXECUTE FUNCTION sync_department_from_job();

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

CREATE OR REPLACE FUNCTION sync_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE "Job"
        SET "jobApplicationCount" = "jobApplicationCount" + 1
        WHERE "id" = NEW."jobId";
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE "Job"
        SET "jobApplicationCount" = GREATEST("jobApplicationCount" - 1, 0)
        WHERE "id" = OLD."jobId";
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW."jobId" <> OLD."jobId" THEN
            UPDATE "Job"
            SET "jobApplicationCount" = GREATEST("jobApplicationCount" - 1, 0)
            WHERE "id" = OLD."jobId";

            UPDATE "Job"
            SET "jobApplicationCount" = "jobApplicationCount" + 1
            WHERE "id" = NEW."jobId";
        END IF;

        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "sync_job_application_count_trigger"
AFTER INSERT OR DELETE OR UPDATE OF "jobId" ON "JobApplication"
FOR EACH ROW
EXECUTE FUNCTION sync_job_application_count();

-- Enable RLS (Supabase)
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Department" ENABLE ROW LEVEL SECURITY;
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

CREATE POLICY "Allow recruiters to read candidate profiles for own job applications" ON "Profile"
FOR SELECT
TO public
USING (
    EXISTS (
        SELECT 1
        FROM "JobApplication"
        INNER JOIN "Job" ON "Job"."id" = "JobApplication"."jobId"
        WHERE "JobApplication"."candidateId" = "Profile"."id"
          AND "Job"."recruiterId" = auth.uid()::text
    )
);

CREATE POLICY "Allow authenticated users to read departments" ON "Department"
FOR SELECT
TO authenticated
USING (true);

-- Create Supabase Storage bucket for resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('resumes', 'resumes', false, 5242880, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create Storage RLS Policies (Supabase)
CREATE POLICY "Allow candidates to upload own resumes" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow candidates to read own resumes" ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow recruiters to read resumes for own jobs" ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'resumes'
    AND EXISTS (
        SELECT 1
        FROM "Job"
        WHERE "Job"."id" = (storage.foldername(name))[2]
          AND "Job"."recruiterId" = auth.uid()::text
    )
);

CREATE POLICY "Allow candidates to update own resumes" ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow candidates to delete own resumes" ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Sync existing Job departments into Department catalog
INSERT INTO "Department" ("name", "updatedAt")
SELECT DISTINCT TRIM("department"), CURRENT_TIMESTAMP
FROM "Job"
WHERE TRIM("department") <> ''
ON CONFLICT ("name") DO NOTHING;

-- Backfill job application counters
UPDATE "Job"
SET "jobApplicationCount" = 0;

UPDATE "Job" j
SET "jobApplicationCount" = counts.total
FROM (
    SELECT "jobId", COUNT(*)::INTEGER AS total
    FROM "JobApplication"
    GROUP BY "jobId"
) AS counts
WHERE j."id" = counts."jobId";

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
