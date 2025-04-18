-- Drop existing tables and functions
drop table if exists public.reminders cascade;
drop table if exists public.expenses cascade;
drop table if exists public.grocery_items cascade;
drop table if exists public.chores cascade;
drop table if exists public.family_members cascade;
drop table if exists public.families cascade;
drop table if exists public.profiles cascade;
drop function if exists public.handle_new_user cascade;
drop trigger if exists on_auth_user_created on auth.users;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  username text,
  family_id uuid,
  created_at timestamp with time zone default now()
);

-- Create families table
create table public.families (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_by uuid references public.profiles on delete cascade not null,
  created_at timestamp with time zone default now()
);

-- Add foreign key to profiles after families table is created
alter table public.profiles 
  add constraint fk_family 
  foreign key (family_id) 
  references public.families(id) 
  on delete set null;

-- Create family_members table
create table public.family_members (
  id uuid default uuid_generate_v4() primary key,
  family_id uuid references public.families on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  role text not null check (role in ('admin', 'member')),
  display_name text not null,
  features_allowed text[] default array[]::text[],
  created_at timestamp with time zone default now(),
  unique(user_id), -- Ensures one family per user
  unique(family_id, user_id)
);

-- Create chores table
create table public.chores (
  id bigint generated by default as identity primary key,
  title text not null,
  description text,
  due_date timestamp with time zone,
  completed boolean default false not null,
  recurring boolean default false not null,
  recurring_interval text,
  created_by uuid references public.profiles on delete cascade not null,
  assigned_to uuid references public.profiles on delete set null,
  family_id uuid references public.families on delete cascade not null,
  created_at timestamp with time zone default now() not null
);

-- Create grocery_items table
create table public.grocery_items (
  id bigint generated by default as identity primary key,
  name text not null,
  quantity integer default 1 not null,
  purchased boolean default false not null,
  created_by uuid references public.profiles on delete cascade not null,
  assigned_to uuid references public.profiles on delete set null,
  family_id uuid references public.families on delete cascade not null,
  is_personal boolean default false not null,
  created_at timestamp with time zone default now() not null
);

-- Create expenses table
create table public.expenses (
  id bigint generated by default as identity primary key,
  title text not null,
  description text,
  amount decimal(10,2) not null,
  date timestamp with time zone default now() not null,
  category text,
  is_personal boolean default false not null,
  paid boolean default false not null,
  created_by uuid references public.profiles on delete cascade not null,
  assigned_to uuid references public.profiles on delete set null,
  family_id uuid references public.families on delete cascade not null,
  created_at timestamp with time zone default now() not null
);

-- Create reminders table
create table public.reminders (
  id bigint generated by default as identity primary key,
  title text not null,
  description text,
  due_date timestamp with time zone not null,
  priority text check (priority in ('low', 'medium', 'high')),
  is_personal boolean default false not null,
  completed boolean default false not null,
  created_by uuid references public.profiles on delete cascade not null,
  assigned_to uuid references public.profiles on delete set null,
  family_id uuid references public.families on delete cascade,
  created_at timestamp with time zone default now() not null
);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
security definer set search_path = public
language plpgsql
as $$
declare
  new_family_id uuid;
begin
  -- Create profile first (without family_id)
  insert into profiles (id, email)
  values (new.id, new.email);
  
  -- Create family with the profile as creator
  insert into families (name, created_by)
  values ('My Family', new.id)
  returning id into new_family_id;
  
  -- Update profile with family_id
  update profiles 
  set family_id = new_family_id
  where id = new.id;
  
  -- Add as family member with admin role and all features
  insert into family_members (family_id, user_id, role, display_name, features_allowed)
  values (
    new_family_id, 
    new.id, 
    'admin', 
    new.email, 
    array['chores', 'groceries', 'expenses', 'reminders']
  );
  
  return new;
exception
  when others then
    raise log 'Error in handle_new_user: %', SQLERRM;
    return new;
end;
$$;

-- Function to get user ID by email (safely)
create or replace function public.get_user_id_by_email(email_input text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid;
begin
  -- Get the user ID from auth.users
  select id into user_id
  from auth.users
  where email = email_input
  limit 1;

  return user_id;
end;
$$;

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all sequences in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all functions in schema public to postgres, anon, authenticated, service_role;

-- Grant access to auth schema and users table
grant usage on schema auth to postgres, service_role;
grant select on auth.users to postgres, service_role;

-- Grant execute permission on the function
grant execute on function public.handle_new_user to postgres, service_role;
grant execute on function public.get_user_id_by_email to authenticated;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user(); 