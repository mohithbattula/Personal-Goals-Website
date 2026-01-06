-- Add frequency column to habits table
-- Stores days of week as array of text: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
-- Default is all days

alter table habits 
add column if not exists frequency text[] default '{Mon,Tue,Wed,Thu,Fri,Sat,Sun}';
