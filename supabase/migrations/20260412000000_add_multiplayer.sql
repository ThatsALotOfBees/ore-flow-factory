-- Multiplayer: game sessions + session members

-- Invite code generator
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    SELECT EXISTS(
      SELECT 1 FROM public.game_sessions WHERE invite_code = code AND status = 'active'
    ) INTO exists_already;
    EXIT WHEN NOT exists_already;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Sessions table
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  save_id UUID NOT NULL REFERENCES public.game_saves(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE DEFAULT public.generate_invite_code(),
  invite_expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  max_players SMALLINT NOT NULL DEFAULT 4 CHECK (max_players BETWEEN 2 AND 4),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_invite_active ON public.game_sessions(invite_code) WHERE status = 'active';
CREATE INDEX idx_sessions_host ON public.game_sessions(host_user_id);

ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Host manages own sessions"
  ON public.game_sessions FOR ALL USING (host_user_id = auth.uid());

CREATE POLICY "Members can view their session"
  ON public.game_sessions FOR SELECT USING (
    id IN (SELECT session_id FROM public.session_members WHERE user_id = auth.uid())
  );

-- Session members table
CREATE TABLE public.session_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('host', 'guest')),
  display_name TEXT NOT NULL DEFAULT 'Player',
  color TEXT NOT NULL DEFAULT '#ffffff',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

CREATE INDEX idx_members_session ON public.session_members(session_id);
CREATE INDEX idx_members_user ON public.session_members(user_id);

ALTER TABLE public.session_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view session members"
  ON public.session_members FOR SELECT USING (
    session_id IN (SELECT session_id FROM public.session_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can leave sessions"
  ON public.session_members FOR DELETE USING (user_id = auth.uid());

-- Player colors assigned round-robin
CREATE OR REPLACE FUNCTION public.pick_player_color(p_session_id UUID)
RETURNS TEXT AS $$
DECLARE
  colors TEXT[] := ARRAY['#f59e0b', '#38bdf8', '#a78bfa', '#fb923c'];
  member_count INT;
BEGIN
  SELECT count(*) INTO member_count FROM public.session_members WHERE session_id = p_session_id;
  RETURN colors[1 + (member_count % array_length(colors, 1))];
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- RPC: Create a multiplayer session
CREATE OR REPLACE FUNCTION public.create_session(p_save_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_session public.game_sessions;
  v_display_name TEXT;
BEGIN
  SELECT display_name INTO v_display_name FROM public.profiles WHERE user_id = auth.uid();

  INSERT INTO public.game_sessions (host_user_id, save_id)
  VALUES (auth.uid(), p_save_id)
  RETURNING * INTO v_session;

  INSERT INTO public.session_members (session_id, user_id, role, display_name, color)
  VALUES (v_session.id, auth.uid(), 'host', COALESCE(v_display_name, 'Host'), '#34d399');

  RETURN jsonb_build_object(
    'session_id', v_session.id,
    'invite_code', v_session.invite_code,
    'invite_expires_at', v_session.invite_expires_at,
    'max_players', v_session.max_players,
    'status', v_session.status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC: Join a session by invite code
CREATE OR REPLACE FUNCTION public.join_session(p_invite_code TEXT)
RETURNS JSONB AS $$
DECLARE
  v_session public.game_sessions;
  v_member_count INT;
  v_display_name TEXT;
  v_color TEXT;
  v_save_data JSONB;
BEGIN
  SELECT * INTO v_session FROM public.game_sessions
  WHERE invite_code = upper(p_invite_code) AND status = 'active' AND invite_expires_at > now();

  IF v_session IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;

  IF v_session.host_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You are already the host of this session';
  END IF;

  SELECT count(*) INTO v_member_count FROM public.session_members WHERE session_id = v_session.id;
  IF v_member_count >= v_session.max_players THEN
    RAISE EXCEPTION 'Session is full';
  END IF;

  -- Check if already a member
  IF EXISTS(SELECT 1 FROM public.session_members WHERE session_id = v_session.id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Already in this session';
  END IF;

  SELECT display_name INTO v_display_name FROM public.profiles WHERE user_id = auth.uid();
  v_color := public.pick_player_color(v_session.id);

  INSERT INTO public.session_members (session_id, user_id, role, display_name, color)
  VALUES (v_session.id, auth.uid(), 'guest', COALESCE(v_display_name, 'Guest'), v_color);

  -- Return session info + save data for initial load
  SELECT save_data INTO v_save_data FROM public.game_saves WHERE id = v_session.save_id;

  RETURN jsonb_build_object(
    'session_id', v_session.id,
    'host_user_id', v_session.host_user_id,
    'invite_code', v_session.invite_code,
    'max_players', v_session.max_players,
    'status', v_session.status,
    'save_data', v_save_data
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC: Leave a session
CREATE OR REPLACE FUNCTION public.leave_session(p_session_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.session_members WHERE session_id = p_session_id AND user_id = auth.uid();

  -- If the host leaves, close the session
  UPDATE public.game_sessions SET status = 'closed'
  WHERE id = p_session_id AND host_user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC: Kick a player (host-only)
CREATE OR REPLACE FUNCTION public.kick_player(p_session_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.game_sessions WHERE id = p_session_id AND host_user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Only the host can kick players';
  END IF;

  DELETE FROM public.session_members WHERE session_id = p_session_id AND user_id = p_user_id AND role = 'guest';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC: Regenerate invite code (host-only)
CREATE OR REPLACE FUNCTION public.regenerate_invite(p_session_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_new_code TEXT;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.game_sessions WHERE id = p_session_id AND host_user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Only the host can regenerate the invite code';
  END IF;

  v_new_code := public.generate_invite_code();
  UPDATE public.game_sessions
  SET invite_code = v_new_code, invite_expires_at = now() + interval '24 hours'
  WHERE id = p_session_id;

  RETURN v_new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable Realtime on session_members for membership change detection
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_members;
