-- A topic may name a record (`milestones.<projectId>`), and record ids are mixed case
-- (`wKbpQmWs3Aj7WXjc2`), so a topic takes upper case letters too.
CREATE OR REPLACE FUNCTION core_live_signal(p_org_id text, p_plugin text, p_topic text, p_user_ids text[] DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF p_plugin !~ '^[a-z][a-z0-9_]{0,39}$' OR p_topic !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$' THEN
    RAISE EXCEPTION 'core_live_signal: invalid plugin or topic';
  END IF;
  PERFORM core_enter_org(p_org_id, p_plugin);
  PERFORM core_live_topic(p_org_id, 'plugin:' || p_plugin || ':' || p_topic, p_user_ids);
END $$;
