-- PROFILES table (Public profile data)
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  website text,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- RLS for Profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for select using (true);

create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Function to handle new user signup (auto-create profile)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
