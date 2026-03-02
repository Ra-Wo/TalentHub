# TalentHub

TalentHub is a role-based hiring platform built with Next.js and Supabase.
It supports recruiter workflows (create/manage jobs and review applications) and candidate workflows (apply to jobs and track status updates).

## Features

- Role-based experience for recruiters and candidates
- Recruiter dashboard for job lifecycle management (`Draft`, `Active`, `Closed`)
- Candidate dashboard for application tracking (`pending`, `reviewing`, `rejected`, `accepted`)
- Resume upload flow backed by Supabase Storage
- Supabase Row Level Security (RLS) policies for secure data access
- Modern UI with Tailwind CSS + shadcn/ui components

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- Tailwind CSS 4
- ESLint + Prettier

## Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create an environment file at the project root:

```bash
cp .env.example .env
```

If `.env.example` does not exist yet, create `.env` manually with:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
NEXT_PUBLIC_SUPABASE_RESUME_BUCKET=resumes
```

3. Set up the database schema in Supabase:

- Open the Supabase SQL editor
- Run the SQL script from `database/setup.sql`

This script creates tables, enums, triggers, RLS policies, and the `resumes` storage bucket.

4. Start the development server:

```bash
npm run dev
```

5. Open the app:

- `http://localhost:3000`

## Available Scripts

- `npm run dev` – start local development server
- `npm run build` – create production build
- `npm run start` – run the production build
- `npm run lint` – run ESLint
- `npm run format` – format files with Prettier
- `npm run format:check` – check formatting without writing changes

## App Routes (high-level)

- `/` – marketing/landing page
- `/auth/signin`, `/auth/signup` – authentication
- `/recruiter` – recruiter dashboard
- `/candidate` – candidate dashboard
- `/settings` – profile/settings page

## Data Model (summary)

Core entities:

- `Profile`
- `Department`
- `Job`
- `JobApplication`

The SQL setup includes triggers for:

- Auto-updating timestamps
- Syncing department catalog entries from jobs
- Keeping `jobApplicationCount` in sync

## Notes

- Environment variables are required at startup; the app throws if Supabase URL or publishable key is missing.
- Resume bucket defaults to `resumes` unless overridden by `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET`.
