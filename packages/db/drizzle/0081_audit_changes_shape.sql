-- Audit `changes` is `{ field: [before, after] }`. Plugins writing through
-- core_record_audit() skipped that check, and an entry like `{ total: 120 }`
-- made the audit log page fail. Values that are not a two-item array now go to
-- `metadata` (the plugin's own metadata keys win), so the write still succeeds.
CREATE OR REPLACE FUNCTION core_record_audit(
  p_org_id text,
  p_source text,
  p_action text,
  p_actor_user_id text DEFAULT NULL,
  p_target_type text DEFAULT NULL,
  p_target_id text DEFAULT NULL,
  p_target_label text DEFAULT NULL,
  p_changes jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL,
  p_ip text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
) RETURNS text
-- As 0026 set it: plugin roles reach core only through this function.
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_id text := replace(gen_random_uuid()::text, '-', '');
  v_changes jsonb := NULL;
  v_other jsonb := '{}'::jsonb;
  v_metadata jsonb := p_metadata;
BEGIN
  IF p_action NOT LIKE p_source || '.%' THEN
    RAISE EXCEPTION 'core_record_audit: the action must start with "%."', p_source;
  END IF;

  IF p_changes IS NOT NULL AND jsonb_typeof(p_changes) = 'object' THEN
    SELECT
      jsonb_object_agg(key, value) FILTER (
        WHERE jsonb_typeof(value) = 'array' AND jsonb_array_length(value) = 2
      ),
      coalesce(jsonb_object_agg(key, value) FILTER (
        WHERE NOT (jsonb_typeof(value) = 'array' AND jsonb_array_length(value) = 2)
      ), '{}'::jsonb)
    INTO v_changes, v_other
    FROM jsonb_each(p_changes);
  ELSIF p_changes IS NOT NULL AND jsonb_typeof(p_changes) <> 'null' THEN
    v_other := jsonb_build_object('changes', p_changes);
  END IF;

  IF v_other <> '{}'::jsonb THEN
    v_metadata := v_other || CASE
      WHEN jsonb_typeof(p_metadata) = 'object' THEN p_metadata
      ELSE '{}'::jsonb
    END;
  END IF;

  PERFORM core_enter_org(p_org_id, p_source);
  INSERT INTO core_audit_logs (
    id, org_id, source, actor_type, actor_id, action, target_type, target_id, target_label, changes, metadata, ip, user_agent
  ) VALUES (
    v_id, p_org_id, p_source, CASE WHEN p_actor_user_id IS NULL THEN 'plugin' ELSE 'user' END,
    coalesce(p_actor_user_id, p_source), p_action, p_target_type, p_target_id, p_target_label,
    v_changes, v_metadata, p_ip, p_user_agent
  );
  RETURN v_id;
END $$;
