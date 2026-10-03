CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

SELECT cron.unschedule('snappots-daily-reminders')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'snappots-daily-reminders');

SELECT cron.schedule(
  'snappots-daily-reminders',
  '0 8 * * *',
  $$SELECT public.run_savings_reminders();$$
);
