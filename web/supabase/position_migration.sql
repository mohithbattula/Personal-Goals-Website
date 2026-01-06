-- Add position column for ordering habits
alter table habits 
add column if not exists position integer default 0;
