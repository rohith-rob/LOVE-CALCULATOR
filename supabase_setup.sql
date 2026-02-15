-- Create the table for storing love calculations
create table public.love_calculations (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name1 text not null,
  name2 text not null,
  percentage integer not null,
  constraint love_calculations_pkey primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.love_calculations enable row level security;

-- Create a policy to allow anyone to insert data (since this is a public app)
-- Ideally, you'd want to restrict read access if privacy is a concern, 
-- but for a simple calculator, we'll allow public reads for now too if you want to show a leaderboard later.
create policy "Enable insert for all users" on "public"."love_calculations"
as permissive for insert
to public
with check (true);

-- DROP the public read policy so only the owner (Supabase Admin) can see the data
-- Run this command in Supabase SQL Editor:
-- drop policy "Enable read access for all users" on "public"."love_calculations";

