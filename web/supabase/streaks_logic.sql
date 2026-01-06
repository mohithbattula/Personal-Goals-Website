-- Function to calculate streaks for a specific habit
create or replace function calculate_streaks(target_habit_id bigint) 
returns void as $$
declare
    streak int := 0;
    max_streak int := 0;
    curr_streak int := 0;
    rec record;
    last_date date := null;
begin
    -- 1. Loop through all completed logs for this habit, ordered by date
    for rec in 
        select date from habit_logs 
        where habit_id = target_habit_id and status = 'completed' 
        order by date asc 
    loop
        -- If start or consecutive
        if last_date is null or rec.date = last_date + interval '1 day' then
            streak := streak + 1;
        -- If duplicate date, ignore
        elsif rec.date = last_date then
            continue;
        -- Gap found, reset
        else
            streak := 1;
        end if;

        -- Track longest streak ever found during this loop
        if streak > max_streak then
            max_streak := streak;
        end if;
        
        last_date := rec.date;
    end loop;

    -- 2. Determine Current Streak
    -- If the Last Successfully Completed Date is Today or Yesterday, the streak is alive.
    -- Otherwise, it has reset to 0.
    if last_date >= (current_date - interval '1 day') then
       curr_streak := streak;
    else
       curr_streak := 0;
    end if;
    
    -- Edge case: If no logs exist, streaks are 0
    if last_date is null then
        curr_streak := 0;
        max_streak := 0;
    end if;

    -- 3. Update the habits table
    update habits 
    set current_streak = curr_streak, 
        longest_streak = max_streak 
    where id = target_habit_id;
end;
$$ language plpgsql security invoker;

-- Trigger Function
create or replace function trigger_update_streaks() returns trigger as $$
begin
    if (TG_OP = 'DELETE') then
        perform calculate_streaks(OLD.habit_id);
        return OLD;
    else
        perform calculate_streaks(NEW.habit_id);
        return NEW;
    end if;
end;
$$ language plpgsql;

-- Trigger execution
drop trigger if exists on_habit_log_change on habit_logs;
create trigger on_habit_log_change
after insert or update or delete on habit_logs
for each row execute procedure trigger_update_streaks();
