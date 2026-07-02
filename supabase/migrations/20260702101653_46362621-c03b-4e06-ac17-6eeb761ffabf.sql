
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name public.app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = has_role.user_id
    AND user_roles.role = has_role.role_name
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
