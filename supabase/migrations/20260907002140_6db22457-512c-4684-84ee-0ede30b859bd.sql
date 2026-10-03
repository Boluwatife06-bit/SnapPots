-- Admin read-only oversight policies
CREATE POLICY "admins read all goals" ON public.savings_goals
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins read all transactions" ON public.transactions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins read all wallets" ON public.wallets
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins read all notifications" ON public.notifications
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins read all goal members" ON public.goal_members
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins read all bank accounts" ON public.bank_accounts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin review helper for BVN (tier 1) and NIN (tier 2) submissions
CREATE OR REPLACE FUNCTION public.review_kyc(_submission_id uuid, _approve boolean, _notes text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL OR NOT public.has_role(_uid, 'admin') THEN
    RAISE EXCEPTION 'Admins only';
  END IF;

  UPDATE public.kyc_submissions
    SET status = CASE WHEN _approve THEN 'approved' ELSE 'rejected' END,
        review_notes = _notes,
        reviewed_by = _uid,
        reviewed_at = now()
    WHERE id = _submission_id;

  PERFORM public.notify(
    (SELECT user_id FROM public.kyc_submissions WHERE id = _submission_id),
    'kyc',
    CASE WHEN _approve THEN 'Identity verified ✅' ELSE 'Verification needs attention' END,
    CASE WHEN _approve THEN 'Your limits have been upgraded.' ELSE COALESCE(_notes, 'Please resubmit clearer documents.') END
  );
END; $$;

REVOKE ALL ON FUNCTION public.review_kyc(uuid, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_kyc(uuid, boolean, text) TO authenticated;