
ALTER TABLE public.quotes
  ALTER COLUMN customer_address DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS customer_first_name text,
  ADD COLUMN IF NOT EXISTS customer_last_name text,
  ADD COLUMN IF NOT EXISTS customer_city text,
  ADD COLUMN IF NOT EXISTS customer_zip text,
  ADD COLUMN IF NOT EXISTS project_timeline text;
