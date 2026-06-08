
-- Make get_user_role STABLE so Postgres caches the result per query,
-- ensuring consistent and efficient RLS policy evaluation.
CREATE OR REPLACE FUNCTION get_user_role(uid uuid)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = uid;
$$;
