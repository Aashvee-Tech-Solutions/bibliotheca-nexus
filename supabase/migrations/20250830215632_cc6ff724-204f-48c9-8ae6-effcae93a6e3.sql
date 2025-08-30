-- Fix remaining security warnings by setting search path for handle_new_user function
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = 'public';
ALTER FUNCTION public.update_available_positions() SET search_path = 'public';