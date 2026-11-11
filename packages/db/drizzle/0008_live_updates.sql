-- Live updates: committed changes are announced with NOTIFY (delivered only
-- on commit; identical payloads in one transaction are sent once). API
-- servers LISTEN and push small signals to browsers over Server-Sent Events.

-- New events wake the event processor at once.
CREATE OR REPLACE FUNCTION core_events_notify() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_notify('core_events', '');
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE TRIGGER core_events_notify AFTER INSERT ON core_events
  FOR EACH STATEMENT EXECUTE FUNCTION core_events_notify();
--> statement-breakpoint
-- A member's inbox changed (new, read, removed): `{ o: org, k: 'inbox', u: user }`.
CREATE OR REPLACE FUNCTION core_notifications_live() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  r core_notifications%ROWTYPE := coalesce(NEW, OLD);
BEGIN
  PERFORM pg_notify('core_live', json_build_object('o', r.org_id, 'k', 'inbox', 'u', r.user_id)::text);
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE TRIGGER core_notifications_live AFTER INSERT OR UPDATE OR DELETE ON core_notifications
  FOR EACH ROW EXECUTE FUNCTION core_notifications_live();
--> statement-breakpoint
-- A timeline changed: `{ o: org, k: 'timeline', t: target type, i: target id }`.
CREATE OR REPLACE FUNCTION core_activities_live() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP <> 'INSERT' THEN
    PERFORM pg_notify('core_live', json_build_object('o', OLD.org_id, 'k', 'timeline', 't', OLD.target_type, 'i', OLD.target_id)::text);
  END IF;
  IF TG_OP <> 'DELETE' THEN
    PERFORM pg_notify('core_live', json_build_object('o', NEW.org_id, 'k', 'timeline', 't', NEW.target_type, 'i', NEW.target_id)::text);
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE TRIGGER core_activities_live AFTER INSERT OR UPDATE OR DELETE ON core_activities
  FOR EACH ROW EXECUTE FUNCTION core_activities_live();
