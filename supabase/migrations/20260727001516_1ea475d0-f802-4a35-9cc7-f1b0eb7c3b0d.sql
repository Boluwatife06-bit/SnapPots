
CREATE TABLE public.kyc_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier smallint NOT NULL DEFAULT 1,
  bvn varchar(11) NOT NULL,
  full_name text NOT NULL,
  date_of_birth date NOT NULL,
  id_type varchar(30) NOT NULL,
  id_document_path text NOT NULL,
  selfie_path text NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending',
  review_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.kyc_submissions TO authenticated;
GRANT ALL ON public.kyc_submissions TO service_role;

ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own kyc" ON public.kyc_submissions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "users insert own kyc" ON public.kyc_submissions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "admins update kyc" ON public.kyc_submissions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER kyc_submissions_set_updated_at
  BEFORE UPDATE ON public.kyc_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.apply_kyc_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    UPDATE public.profiles
      SET kyc_level = GREATEST(kyc_level, NEW.tier),
          kyc_status = 'approved',
          updated_at = now()
      WHERE id = NEW.user_id;

    IF NEW.tier >= 1 THEN
      UPDATE public.wallets
        SET daily_limit = GREATEST(daily_limit, 200000),
            monthly_limit = GREATEST(monthly_limit, 2000000),
            updated_at = now()
        WHERE user_id = NEW.user_id;
    END IF;
  ELSIF NEW.status = 'rejected' AND (OLD.status IS DISTINCT FROM 'rejected') THEN
    UPDATE public.profiles
      SET kyc_status = 'rejected', updated_at = now()
      WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER kyc_submissions_apply_approval
  AFTER UPDATE ON public.kyc_submissions
  FOR EACH ROW EXECUTE FUNCTION public.apply_kyc_approval();

-- Ensure the auth signup trigger exists (idempotent).
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
