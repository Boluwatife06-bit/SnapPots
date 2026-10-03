
-- Wallet deposit (funds in), withdrawal (funds out) and flex pot withdrawal
CREATE OR REPLACE FUNCTION public.wallet_deposit(_amount numeric)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _wallet uuid; _lvl smallint; _st varchar; _txn uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _amount < 100 THEN RAISE EXCEPTION 'Minimum deposit is 100'; END IF;
  SELECT kyc_level, kyc_status INTO _lvl, _st FROM public.profiles WHERE id = _uid;
  IF COALESCE(_lvl,0) < 1 OR _st <> 'approved' THEN RAISE EXCEPTION 'Verify your identity to fund your wallet'; END IF;

  SELECT id INTO _wallet FROM public.wallets WHERE user_id = _uid FOR UPDATE;
  IF _wallet IS NULL THEN RAISE EXCEPTION 'Wallet not found'; END IF;
  UPDATE public.wallets SET balance = balance + _amount, updated_at = now() WHERE id = _wallet;

  INSERT INTO public.transactions (user_id, wallet_id, type, status, amount, fee_amount, net_amount, description, reference, completed_at)
  VALUES (_uid, _wallet, 'deposit', 'completed', _amount, 0, _amount, 'Wallet top-up',
          'DP-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)), now())
  RETURNING id INTO _txn;

  PERFORM public.notify(_uid, 'deposit', 'Wallet funded', 'Your wallet was credited with ' || _amount::text || '. Receipt is ready.');
  RETURN _txn;
END; $$;

CREATE OR REPLACE FUNCTION public.wallet_withdraw(_amount numeric, _bank_account_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _w public.wallets; _lvl smallint; _st varchar;
        _fee numeric; _net numeric; _today numeric; _month numeric; _bank public.bank_accounts; _txn uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _amount < 100 THEN RAISE EXCEPTION 'Minimum withdrawal is 100'; END IF;
  SELECT kyc_level, kyc_status INTO _lvl, _st FROM public.profiles WHERE id = _uid;
  IF COALESCE(_lvl,0) < 1 OR _st <> 'approved' THEN RAISE EXCEPTION 'Verify your identity to withdraw'; END IF;

  SELECT * INTO _bank FROM public.bank_accounts WHERE id = _bank_account_id AND user_id = _uid;
  IF _bank.id IS NULL THEN RAISE EXCEPTION 'Select a bank account you own'; END IF;

  SELECT * INTO _w FROM public.wallets WHERE user_id = _uid FOR UPDATE;
  IF _w.id IS NULL THEN RAISE EXCEPTION 'Wallet not found'; END IF;

  _fee := LEAST(GREATEST(round(_amount * 0.005, 2), 25), 500);
  IF _w.balance < _amount THEN RAISE EXCEPTION 'Insufficient wallet balance'; END IF;

  SELECT COALESCE(sum(amount),0) INTO _today FROM public.transactions
    WHERE user_id = _uid AND type = 'withdrawal' AND status <> 'failed' AND created_at::date = CURRENT_DATE;
  IF _today + _amount > _w.daily_limit THEN RAISE EXCEPTION 'Daily withdrawal limit reached'; END IF;

  SELECT COALESCE(sum(amount),0) INTO _month FROM public.transactions
    WHERE user_id = _uid AND type = 'withdrawal' AND status <> 'failed' AND date_trunc('month', created_at) = date_trunc('month', now());
  IF _month + _amount > _w.monthly_limit THEN RAISE EXCEPTION 'Monthly withdrawal limit reached'; END IF;

  _net := _amount - _fee;
  UPDATE public.wallets SET balance = balance - _amount, updated_at = now() WHERE id = _w.id;

  INSERT INTO public.transactions (user_id, wallet_id, type, status, amount, fee_amount, net_amount, description, reference, completed_at, metadata)
  VALUES (_uid, _w.id, 'withdrawal', 'completed', _amount, _fee, _net,
          'Payout to ' || _bank.bank_name || ' ••••' || right(_bank.account_number, 4),
          'WD-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)), now(),
          jsonb_build_object('bank_name', _bank.bank_name, 'account_name', _bank.account_name, 'account_number', right(_bank.account_number,4)))
  RETURNING id INTO _txn;

  PERFORM public.notify(_uid, 'withdrawal', 'Withdrawal sent', _net::text || ' is on its way to ' || _bank.bank_name || '. Receipt is ready.');
  RETURN _txn;
END; $$;

CREATE OR REPLACE FUNCTION public.pot_withdraw(_goal_id uuid, _amount numeric)
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _goal public.savings_goals; _mine numeric; _wallet uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'Amount must be greater than zero'; END IF;
  SELECT * INTO _goal FROM public.savings_goals WHERE id = _goal_id FOR UPDATE;
  IF _goal.id IS NULL THEN RAISE EXCEPTION 'Pot not found'; END IF;
  IF _goal.pot_type <> 'flex' THEN RAISE EXCEPTION 'Only flex pots allow instant withdrawal. Break the pot instead.'; END IF;
  IF _goal.lock_until IS NOT NULL AND _goal.lock_until > CURRENT_DATE THEN RAISE EXCEPTION 'This pot is still locked'; END IF;

  SELECT COALESCE(contribution_total,0) INTO _mine FROM public.goal_members WHERE goal_id = _goal_id AND user_id = _uid;
  IF _goal.created_by = _uid AND COALESCE(_mine,0) = 0 THEN _mine := _goal.current_amount; END IF;
  IF COALESCE(_mine,0) < _amount THEN RAISE EXCEPTION 'You have only % in this pot', COALESCE(_mine,0); END IF;

  SELECT id INTO _wallet FROM public.wallets WHERE user_id = _uid FOR UPDATE;
  UPDATE public.wallets SET balance = balance + _amount, updated_at = now() WHERE id = _wallet;
  UPDATE public.savings_goals SET current_amount = GREATEST(current_amount - _amount, 0), updated_at = now() WHERE id = _goal_id;
  UPDATE public.goal_members SET contribution_total = GREATEST(contribution_total - _amount, 0) WHERE goal_id = _goal_id AND user_id = _uid;

  INSERT INTO public.transactions (user_id, goal_id, wallet_id, type, status, amount, fee_amount, net_amount, description, reference, completed_at)
  VALUES (_uid, _goal_id, _wallet, 'goal_withdrawal', 'completed', _amount, 0, _amount, 'Withdrawal from ' || _goal.name,
          'PW-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)), now());

  PERFORM public.notify(_uid, 'pot', 'Flex withdrawal', _amount::text || ' moved from ' || _goal.name || ' to your wallet.');
  RETURN _amount;
END; $$;

-- Reminder engine: streak nudges + pot deadline alerts (idempotent per day)
CREATE OR REPLACE FUNCTION public.run_savings_reminders()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _count integer := 0; _r record;
BEGIN
  FOR _r IN
    SELECT p.id, p.streak_count FROM public.profiles p
    WHERE COALESCE(p.streak_count,0) > 0
      AND (p.last_save_date IS NULL OR p.last_save_date < CURRENT_DATE)
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n
        WHERE n.user_id = p.id AND n.type = 'streak_reminder' AND n.created_at::date = CURRENT_DATE)
  LOOP
    PERFORM public.notify(_r.id, 'streak_reminder', 'Keep your ' || _r.streak_count || ' day streak 🔥',
      'You have not saved yet today. A quick top-up keeps the flame alive.');
    _count := _count + 1;
  END LOOP;

  FOR _r IN
    SELECT g.id, g.name, g.created_by, g.due_date FROM public.savings_goals g
    WHERE g.status = 'active' AND g.due_date IS NOT NULL
      AND g.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 3
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n
        WHERE n.user_id = g.created_by AND n.type = 'deadline'
          AND n.body LIKE '%' || g.name || '%' AND n.created_at::date = CURRENT_DATE)
  LOOP
    PERFORM public.notify(_r.created_by, 'deadline', 'Pot deadline approaching',
      _r.name || ' matures on ' || to_char(_r.due_date, 'DD Mon YYYY') || '. Top it up before then.');
    _count := _count + 1;
  END LOOP;

  RETURN _count;
END; $$;

REVOKE ALL ON FUNCTION public.wallet_deposit(numeric) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.wallet_withdraw(numeric, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.pot_withdraw(uuid, numeric) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.run_savings_reminders() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.wallet_deposit(numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.wallet_withdraw(numeric, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pot_withdraw(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.run_savings_reminders() TO service_role;
