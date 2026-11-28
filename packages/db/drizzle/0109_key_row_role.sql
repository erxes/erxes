-- An API key's row limits (owners, tags; drizzle/0083_api_key_rules.sql) apply to the role a
-- request with such a key acts as, erxes_core_keyed, instead of to every role. Every other
-- request read the restrictive policy too: Postgres can't tell at planning time that its
-- settings are empty, so it guessed that a quarter of an organisation's contacts were visible
-- and checked the policy's tag subquery on every row. withOrg sets the key's limits and this
-- role in the same statement (packages/db/src/tenant.ts), so a key never runs without its
-- limits. Organisations stay apart as before: core_tenant applies to every role.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'erxes_core_keyed') THEN
    CREATE ROLE erxes_core_keyed NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
END $$;
--> statement-breakpoint
-- The keyed role has the runtime role's rights: core's tables and plugins' relation views.
SELECT core_grant_data('erxes_core_keyed');
--> statement-breakpoint
GRANT erxes_core_reader TO erxes_core_keyed WITH INHERIT TRUE;
--> statement-breakpoint
ALTER POLICY core_api_key_rows ON core_customers TO erxes_core_keyed;
--> statement-breakpoint
ALTER POLICY core_api_key_rows ON core_companies TO erxes_core_keyed;
--> statement-breakpoint
-- The runtime role may become erxes_core_keyed (SET), but doesn't hold its rights (INHERIT FALSE).
CREATE OR REPLACE FUNCTION core_grant_runtime(p_role text) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM core_grant_data(p_role);
  PERFORM core_grant_data('erxes_core_system');
  PERFORM core_grant_data('erxes_core_keyed');
  EXECUTE format('GRANT erxes_core_system TO %I WITH INHERIT FALSE, SET TRUE', p_role);
  EXECUTE format('GRANT erxes_core_keyed TO %I WITH INHERIT FALSE, SET TRUE', p_role);
  EXECUTE format('GRANT erxes_core_reader TO %I WITH INHERIT TRUE', p_role);
  GRANT erxes_core_reader TO erxes_core_system WITH INHERIT TRUE;
  GRANT erxes_core_reader TO erxes_core_keyed WITH INHERIT TRUE;
END $$;
--> statement-breakpoint
-- Runtime roles granted before this migration (those that may become erxes_core_system), and the
-- migrating login when it is also the app's (DbOptions.role), as drizzle/0052_system_role.sql does.
DO $$
DECLARE
  r text;
BEGIN
  IF NOT pg_has_role(current_user, 'erxes_core_keyed', 'SET')
    AND pg_has_role(current_user, 'erxes_core_keyed', 'MEMBER WITH ADMIN OPTION') THEN
    EXECUTE format('GRANT erxes_core_keyed TO %I WITH INHERIT FALSE, SET TRUE', current_user);
  END IF;

  FOR r IN
    SELECT member::regrole::text FROM pg_auth_members
    WHERE roleid = 'erxes_core_system'::regrole AND member <> current_user::regrole
  LOOP
    EXECUTE format('GRANT erxes_core_keyed TO %s WITH INHERIT FALSE, SET TRUE', r);
  END LOOP;
END $$;
