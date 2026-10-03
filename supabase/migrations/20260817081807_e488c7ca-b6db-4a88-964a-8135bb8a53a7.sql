
REVOKE EXECUTE ON FUNCTION public.create_pot(varchar, varchar, numeric, date, varchar, date, varchar) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.join_pot(varchar) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.quick_save(uuid, numeric) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.break_pot(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.create_pot(varchar, varchar, numeric, date, varchar, date, varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_pot(varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION public.quick_save(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.break_pot(uuid) TO authenticated;
