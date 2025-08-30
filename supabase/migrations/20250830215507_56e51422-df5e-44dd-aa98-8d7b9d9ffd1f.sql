-- Fix security warnings by setting proper search paths for functions

-- Fix search path for existing functions
ALTER FUNCTION public.generate_slug(text) SET search_path = 'public';
ALTER FUNCTION public.trigger_generate_slug() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';