-- withSystem() spans organisations by acting as erxes_core_system for its
-- transaction (SET LOCAL ROLE), a role that bypasses row level security. The
-- tenant policy is then a plain equality on org_id, which Postgres can use
-- with the indexes that lead with org_id. The old policy OR-ed it with an
-- app.system setting, and that OR made every query without its own org_id
-- filter a sequential scan.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'erxes_core_system') THEN
    CREATE ROLE erxes_core_system NOLOGIN BYPASSRLS NOSUPERUSER NOCREATEDB NOCREATEROLE;
  END IF;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_tenant_visible(p_org_id text) RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT p_org_id = current_setting('app.org_id', true)
$$;
--> statement-breakpoint
-- Data rights on core's tables, now and for the tables later migrations add.
CREATE OR REPLACE FUNCTION core_grant_data(p_role text) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format('GRANT USAGE ON SCHEMA public TO %I', p_role);
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO %I', p_role);
  EXECUTE format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO %I', p_role);
  EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO %I', p_role);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I', p_role);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO %I', p_role);
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO %I', p_role);
END $$;
--> statement-breakpoint
-- The runtime role may become erxes_core_system (SET), but doesn't hold its
-- rights by default (INHERIT FALSE).
CREATE OR REPLACE FUNCTION core_grant_runtime(p_role text) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM core_grant_data(p_role);
  PERFORM core_grant_data('erxes_core_system');
  EXECUTE format('GRANT erxes_core_system TO %I WITH INHERIT FALSE, SET TRUE', p_role);
END $$;
--> statement-breakpoint
-- withSystem works right after migrating, before any runtime role is granted:
-- erxes_core_system gets its data rights here, and the migrating login, when
-- it is also the app's login (DbOptions.role), may SET to it. A login that
-- created the role holds its ADMIN option (Postgres 16+) and grants itself
-- SET; one that didn't goes through core_grant_runtime instead.
SELECT core_grant_data('erxes_core_system');
--> statement-breakpoint
DO $$ BEGIN
  IF NOT pg_has_role(current_user, 'erxes_core_system', 'SET')
    AND pg_has_role(current_user, 'erxes_core_system', 'MEMBER WITH ADMIN OPTION') THEN
    EXECUTE format('GRANT erxes_core_system TO %I WITH INHERIT FALSE, SET TRUE', current_user);
  END IF;
END $$;
