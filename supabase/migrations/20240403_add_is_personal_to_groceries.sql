-- Add is_personal column to grocery_items table
alter table public.grocery_items
  add column is_personal boolean default true not null;

-- Update existing items
-- Set family items as not personal
update public.grocery_items
set is_personal = false
where family_id is not null;

-- Set personal items as personal
update public.grocery_items
set is_personal = true
where family_id is null;

-- Update RLS policies
drop policy if exists "Users can view and manage family grocery items" on public.grocery_items;

create policy "Users can view their personal and family grocery items"
  on public.grocery_items for select
  using (
    auth.uid() = user_id
    or (
      family_id in (
        select family_id from public.family_members
        where user_id = auth.uid()
      )
      and not is_personal
    )
  );

create policy "Users can manage their personal grocery items"
  on public.grocery_items for all
  using (auth.uid() = user_id);

create policy "Users can manage family grocery items"
  on public.grocery_items for all
  using (
    family_id in (
      select family_id from public.family_members
      where user_id = auth.uid()
    )
    and not is_personal
  ); 