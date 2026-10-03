
ALTER TABLE public.savings_goals
  ADD COLUMN IF NOT EXISTS pot_type varchar NOT NULL DEFAULT 'solo',
  ADD COLUMN IF NOT EXISTS lock_until date,
  ADD COLUMN IF NOT EXISTS penalty_rate numeric NOT NULL DEFAULT 5.00;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_save_date date;

CREATE OR REPLACE FUNCTION public.notify(_user_id uuid, _type varchar, _title varchar, _body text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications (user_id, type, title, body) VALUES (_user_id, _type, _title, _body);
$$;

CREATE OR REPLACE FUNCTION public.create_pot(
  _name varchar, _emoji varchar, _target numeric, _due date,
  _pot_type varchar DEFAULT 'solo', _lock_until date DEFAULT NULL, _visibility varchar DEFAULT 'private'
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _id uuid; _code varchar;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _target <= 0 THEN RAISE EXCEPTION 'Target must be greater than zero'; END IF;
  IF _pot_type NOT IN ('solo','group','flex') THEN RAISE EXCEPTION 'Invalid pot type'; END IF;
  _code := upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
  INSERT INTO public.savings_goals (name, emoji, target_amount, due_date, created_by, pot_type, lock_until, visibility, invite_code)
  VALUES (_name, COALESCE(_emoji,'🎯'), _target, _due, _uid, _pot_type, _lock_until,
          CASE WHEN _pot_type = 'group' THEN COALESCE(_visibility,'public') ELSE COALESCE(_visibility,'private') END,
          CASE WHEN _pot_type = 'group' THEN _code ELSE NULL END)
  RETURNING id INTO _id;
  INSERT INTO public.goal_members (goal_id, user_id, role) VALUES (_id, _uid, 'owner');
  PERFORM public.notify(_uid, 'pot', 'Pot created', _name || ' is live. Time to fill it up.');
  RETURN _id;
END; $$;

CREATE OR REPLACE FUNCTION public.join_pot(_invite_code varchar)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _goal public.savings_goals;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _goal FROM public.savings_goals WHERE invite_code = upper(_invite_code);
  IF _goal.id IS NULL THEN RAISE EXCEPTION 'Invalid invite code'; END IF;
  INSERT INTO public.goal_members (goal_id, user_id, role) VALUES (_goal.id, _uid, 'member')
    ON CONFLICT DO NOTHING;
  PERFORM public.notify(_goal.created_by, 'social', 'Someone joined your pot', 'A new member joined ' || _goal.name || '.');
  RETURN _goal.id;
END; $$;

CREATE OR REPLACE FUNCTION public.quick_save(_goal_id uuid, _amount numeric)
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _bal numeric; _wallet uuid; _last date; _streak integer; _name varchar;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'Amount must be greater than zero'; END IF;
  IF NOT (public.is_goal_member(_goal_id, _uid) OR EXISTS (SELECT 1 FROM public.savings_goals WHERE id = _goal_id AND created_by = _uid)) THEN
    RAISE EXCEPTION 'You are not a member of this pot';
  END IF;
  SELECT id, balance INTO _wallet, _bal FROM public.wallets WHERE user_id = _uid FOR UPDATE;
  IF _wallet IS NULL THEN RAISE EXCEPTION 'Wallet not found'; END IF;
  IF _bal < _amount THEN RAISE EXCEPTION 'Insufficient wallet balance'; END IF;

  UPDATE public.wallets SET balance = balance - _amount, updated_at = now() WHERE id = _wallet;
  UPDATE public.savings_goals SET current_amount = current_amount + _amount, updated_at = now()
    WHERE id = _goal_id RETURNING name INTO _name;
  UPDATE public.goal_members SET contribution_total = contribution_total + _amount
    WHERE goal_id = _goal_id AND user_id = _uid;

  INSERT INTO public.transactions (user_id, goal_id, wallet_id, type, status, amount, net_amount, description, reference, completed_at)
  VALUES (_uid, _goal_id, _wallet, 'goal_contribution', 'completed', _amount, _amount, 'Quick save into ' || _name,
          'QS-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)), now());

  SELECT last_save_date, streak_count INTO _last, _streak FROM public.profiles WHERE id = _uid FOR UPDATE;
  IF _last IS DISTINCT FROM CURRENT_DATE THEN
    IF _last = CURRENT_DATE - 1 THEN _streak := COALESCE(_streak,0) + 1; ELSE _streak := 1; END IF;
    UPDATE public.profiles
      SET streak_count = _streak,
          longest_streak = GREATEST(longest_streak, _streak),
          last_save_date = CURRENT_DATE,
          updated_at = now()
      WHERE id = _uid;
    PERFORM public.notify(_uid, 'streak', _streak || ' day streak 🔥', 'You saved today. Keep the flame alive.');
  END IF;
  RETURN _amount;
END; $$;

CREATE OR REPLACE FUNCTION public.break_pot(_goal_id uuid)
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _goal public.savings_goals; _mine numeric; _penalty numeric; _net numeric; _wallet uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _goal FROM public.savings_goals WHERE id = _goal_id FOR UPDATE;
  IF _goal.id IS NULL THEN RAISE EXCEPTION 'Pot not found'; END IF;
  IF _goal.created_by <> _uid THEN RAISE EXCEPTION 'Only the pot owner can break this pot'; END IF;

  SELECT COALESCE(contribution_total, 0) INTO _mine FROM public.goal_members WHERE goal_id = _goal_id AND user_id = _uid;
  _mine := COALESCE(NULLIF(_mine, 0), _goal.current_amount);
  IF _mine <= 0 THEN RAISE EXCEPTION 'Nothing to withdraw'; END IF;

  IF _goal.lock_until IS NOT NULL AND _goal.lock_until > CURRENT_DATE THEN
    _penalty := round(_mine * _goal.penalty_rate / 100, 2);
  ELSE
    _penalty := 0;
  END IF;
  _net := _mine - _penalty;

  SELECT id INTO _wallet FROM public.wallets WHERE user_id = _uid FOR UPDATE;
  UPDATE public.wallets SET balance = balance + _net, updated_at = now() WHERE id = _wallet;
  UPDATE public.savings_goals SET current_amount = GREATEST(current_amount - _mine, 0), status = 'broken', updated_at = now() WHERE id = _goal_id;
  UPDATE public.goal_members SET contribution_total = 0 WHERE goal_id = _goal_id AND user_id = _uid;

  INSERT INTO public.transactions (user_id, goal_id, wallet_id, type, status, amount, fee_amount, net_amount, description, reference, completed_at)
  VALUES (_uid, _goal_id, _wallet, 'goal_withdrawal', 'completed', _mine, _penalty, _net,
          'Broke pot ' || _goal.name, 'BP-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)), now());

  PERFORM public.notify(_uid, 'pot', 'Pot broken', 'You withdrew from ' || _goal.name || '. Penalty applied: ' || _penalty::text);
  RETURN _net;
END; $$;

GRANT EXECUTE ON FUNCTION public.create_pot(varchar, varchar, numeric, date, varchar, date, varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_pot(varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION public.quick_save(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.break_pot(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.notify(uuid, varchar, varchar, text) FROM public, anon, authenticated;
