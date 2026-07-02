
-- Recreate payment_analytics view as SECURITY INVOKER so it respects RLS of the caller
CREATE OR REPLACE VIEW public.payment_analytics
WITH (security_invoker = on)
AS
SELECT
  DATE_TRUNC('day', created_at) as payment_date,
  payment_method,
  payment_status,
  'authorship' as purchase_type,
  COUNT(*) as transaction_count,
  SUM(total_amount) as total_amount,
  AVG(total_amount) as avg_amount
FROM public.authorship_purchases
GROUP BY DATE_TRUNC('day', created_at), payment_method, payment_status

UNION ALL

SELECT
  DATE_TRUNC('day', created_at) as payment_date,
  payment_method,
  payment_status,
  'book' as purchase_type,
  COUNT(*) as transaction_count,
  SUM(total_amount) as total_amount,
  AVG(total_amount) as avg_amount
FROM public.book_purchases
GROUP BY DATE_TRUNC('day', created_at), payment_method, payment_status

ORDER BY payment_date DESC;

-- Revoke public execute on SECURITY DEFINER helper functions and grant only to authenticated/service_role
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.generate_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_slug(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.trigger_generate_slug() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.trigger_generate_slug() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.update_available_positions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_available_positions() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.log_payment_event(uuid, text, text, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_payment_event(uuid, text, text, jsonb, text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.log_authorship_payment_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_authorship_payment_status() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.update_book_purchase_updated_at() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_book_purchase_updated_at() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.update_book_purchase_payment_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_book_purchase_payment_status() TO authenticated, service_role;

-- The payment_logs INSERT policy WITH CHECK (true) is intentionally permissive for system/edge-function logging
-- No other sensitive data is exposed by it; SELECT remains admin-only.
