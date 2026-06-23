-- ════════════════════════════════════════════════════════════════
-- NevInfotech Portal — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────
-- companies
-- ──────────────────────────────────────────────
create table if not exists public.companies (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  r2_path     text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists companies_owner_id_idx on public.companies(owner_id);

alter table public.companies enable row level security;

create policy "Owners can view their companies"
  on public.companies for select
  using (auth.uid() = owner_id);

create policy "Owners can insert their companies"
  on public.companies for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their companies"
  on public.companies for update
  using (auth.uid() = owner_id);

-- ──────────────────────────────────────────────
-- files (metadata only — binary content lives in Cloudflare R2)
-- ──────────────────────────────────────────────
create table if not exists public.files (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  file_name    text not null,
  file_key     text not null,            -- full R2 object key, e.g. companies/{id}/{fileId}-name.pdf
  file_type    text not null,            -- MIME type
  size         bigint not null default 0,
  uploaded_by  uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now()
);

create index if not exists files_company_id_idx on public.files(company_id);

alter table public.files enable row level security;

create policy "Owners can view files of their companies"
  on public.files for select
  using (
    exists (
      select 1 from public.companies c
      where c.id = files.company_id and c.owner_id = auth.uid()
    )
  );

create policy "Owners can insert files into their companies"
  on public.files for insert
  with check (
    exists (
      select 1 from public.companies c
      where c.id = files.company_id and c.owner_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────
-- Allowed MIME types reference (enforced in application code, not the DB):
--   application/pdf
--   application/vnd.openxmlformats-officedocument.wordprocessingml.document  (.docx)
--   application/vnd.openxmlformats-officedocument.spreadsheetml.sheet        (.xlsx)
--   image/png
--   image/jpeg
-- ──────────────────────────────────────────────
