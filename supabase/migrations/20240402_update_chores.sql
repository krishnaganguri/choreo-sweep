-- Add priority and status columns to chores table
alter table public.chores
  add column priority text check (priority in ('low', 'medium', 'high')) not null default 'medium',
  add column status text check (status in ('pending', 'in_progress', 'completed')) not null default 'pending';

-- Migrate existing data
update public.chores
set 
  status = case 
    when completed then 'completed'
    else 'pending'
  end,
  priority = 'medium';

-- Remove old columns
alter table public.chores
  drop column completed,
  drop column recurring,
  drop column recurring_interval; 