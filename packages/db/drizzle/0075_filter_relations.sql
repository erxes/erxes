-- Relation filters: a plugin declares relations in its manifest (a customer's
-- deals, orders, tickets) and keeps a view of them, `<plugin>_*`, which core's
-- list filters read ("has more than 3 won deals"). Plugin roles have no rights
-- on core's tables and core's roles none on plugins' (a plugin owns its tables),
-- so a plugin grants its views to erxes_core_reader:
--   GRANT SELECT ON sales_customer_deals TO erxes_core_reader;
-- A view reads its tables as its owner, the plugin's role, so the tables' forced
-- row level security keeps its rows to the organisation in app.org_id. Core
-- reads a relation only from a view its plugin's role owns.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'erxes_core_reader') THEN
    CREATE ROLE erxes_core_reader NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
END $$;
--> statement-breakpoint
-- The runtime role (and erxes_core_system) hold what is granted to erxes_core_reader.
CREATE OR REPLACE FUNCTION core_grant_runtime(p_role text) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM core_grant_data(p_role);
  PERFORM core_grant_data('erxes_core_system');
  EXECUTE format('GRANT erxes_core_system TO %I WITH INHERIT FALSE, SET TRUE', p_role);
  EXECUTE format('GRANT erxes_core_reader TO %I WITH INHERIT TRUE', p_role);
  GRANT erxes_core_reader TO erxes_core_system WITH INHERIT TRUE;
END $$;
--> statement-breakpoint
-- Runtime roles granted before this migration: those that may become erxes_core_system.
DO $$
DECLARE
  r text;
BEGIN
  GRANT erxes_core_reader TO erxes_core_system WITH INHERIT TRUE;
  EXECUTE format('GRANT erxes_core_reader TO %I WITH INHERIT TRUE', current_user);

  FOR r IN
    SELECT member::regrole::text FROM pg_auth_members
    WHERE roleid = 'erxes_core_system'::regrole AND member <> current_user::regrole
  LOOP
    EXECUTE format('GRANT erxes_core_reader TO %s WITH INHERIT TRUE', r);
  END LOOP;
END $$;
