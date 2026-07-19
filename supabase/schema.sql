create extension if not exists pgcrypto;

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  code_hash text not null unique,
  display_name text not null,
  invitation_type text not null default 'family' check (invitation_type in ('family', 'personal', 'couple')),
  max_adults integer not null default 1 check (max_adults between 0 and 20),
  max_children integer not null default 0 check (max_children between 0 and 20),
  created_at timestamptz not null default now()
);

alter table public.invitations
  add column if not exists invitation_type text not null default 'family';

create table if not exists public.rsvps (
  invitation_id uuid primary key references public.invitations(id) on delete cascade,
  attendance boolean not null,
  adult_count integer not null default 0 check (adult_count between 0 and 20),
  child_count integer not null default 0 check (child_count between 0 and 20),
  guests jsonb not null default '[]'::jsonb,
  email text not null default '',
  message text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists invitations_code_hash_idx
  on public.invitations (code_hash);

alter table public.invitations enable row level security;
alter table public.rsvps enable row level security;

-- No public policies are intentionally created. The website accesses these
-- tables only through the server-side API using the Supabase service role.
