
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;
REVOKE EXECUTE ON FUNCTION public.generate_slug(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.trigger_generate_slug() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_available_positions() FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_payment_event(uuid, text, text, jsonb, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_authorship_payment_status() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_book_purchase_updated_at() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_book_purchase_payment_status() FROM anon;
