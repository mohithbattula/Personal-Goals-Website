-- OPTIONAL: Database Helper for Analytics
-- This view helps calculate completion rates per habit quickly

create or replace view habit_completion_stats with (security_invoker=true) as
select 
  h.id as habit_id,
  h.user_id,
  h.name,
  h.icon,
  count(hl.id) as completed_count
from habits h
left join habit_logs hl on h.id = hl.habit_id and hl.status = 'completed'
group by h.id, h.user_id, h.name, h.icon;

-- Index for faster date range queries
create index if not exists idx_habit_logs_date on habit_logs(date);
create index if not exists idx_habit_logs_composite on habit_logs(user_id, date, habit_id);
