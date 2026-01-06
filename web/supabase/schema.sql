-- Enable UUID extension (still needed for auth.users)
create extension if not exists "uuid-ossp";

-- USERS table is managed by Supabase Auth (auth.uid() is uuid)

-- HABITS table (IDs are now sequential 1, 2, 3...)
create table habits (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users not null,
  name text not null,
  icon text,
  target_per_month integer default 30,
  current_streak integer default 0,
  longest_streak integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- HABIT LOGS table
create table habit_logs (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users not null,
  habit_id bigint references habits(id) on delete cascade not null,
  date date not null,
  status text check (status in ('completed', 'skipped')) default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(habit_id, date)
);

-- GOALS table
create table goals (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  target_date date,
  status text check (status in ('pending', 'in_progress', 'completed')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ACHIEVEMENTS table
create table achievements (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users not null,
  type text not null,
  label text not null,
  earned_date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table goals enable row level security;
alter table achievements enable row level security;

-- Policies
create policy "Users can view their own habits" on habits for select using (auth.uid() = user_id);
create policy "Users can insert their own habits" on habits for insert with check (auth.uid() = user_id);
create policy "Users can update their own habits" on habits for update using (auth.uid() = user_id);
create policy "Users can delete their own habits" on habits for delete using (auth.uid() = user_id);

create policy "Users can view their own logs" on habit_logs for select using (auth.uid() = user_id);
create policy "Users can insert their own logs" on habit_logs for insert with check (auth.uid() = user_id);
create policy "Users can update their own logs" on habit_logs for update using (auth.uid() = user_id);
create policy "Users can delete their own logs" on habit_logs for delete using (auth.uid() = user_id);

create policy "Users can view their own goals" on goals for select using (auth.uid() = user_id);
create policy "Users can insert their own goals" on goals for insert with check (auth.uid() = user_id);
create policy "Users can update their own goals" on goals for update using (auth.uid() = user_id);
create policy "Users can delete their own goals" on goals for delete using (auth.uid() = user_id);

create policy "Users can view their own achievements" on achievements for select using (auth.uid() = user_id);
