
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_slug(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_generate_slug() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.update_available_positions() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.log_payment_event(uuid, text, text, jsonb, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.log_authorship_payment_status() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.update_book_purchase_updated_at() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.update_book_purchase_payment_status() FROM authenticated;

-- Keep has_role executable by authenticated because it is used in RLS policies.
-- Keep log_payment_event executable by service_role for edge-function logging.
