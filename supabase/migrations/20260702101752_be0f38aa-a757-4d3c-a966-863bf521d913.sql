
DROP POLICY IF EXISTS "System can insert payment logs" ON public.payment_logs;

CREATE POLICY "System can insert payment logs" ON public.payment_logs
FOR INSERT
WITH CHECK (false);
