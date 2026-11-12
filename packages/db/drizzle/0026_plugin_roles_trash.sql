CREATE TABLE "core_trash" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"record_type" text NOT NULL,
	"record_id" text NOT NULL,
	"label" text,
	"snapshot" jsonb NOT NULL,
	"deleted_by_type" text NOT NULL,
	"deleted_by" text,
	"deleted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"purge_at" timestamp with time zone NOT NULL,
	CONSTRAINT "core_trash_record_type_check" CHECK ("core_trash"."record_type" IN ('customer', 'company'))
);
--> statement-breakpoint
ALTER TABLE "core_plugin_installations" ADD COLUMN "status_reason" text;--> statement-breakpoint
ALTER TABLE "core_trash" ADD CONSTRAINT "core_trash_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_trash_record_key" ON "core_trash" USING btree ("org_id","record_type","record_id");--> statement-breakpoint
CREATE INDEX "core_trash_org_idx" ON "core_trash" USING btree ("org_id","deleted_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_trash_purge_idx" ON "core_trash" USING btree ("purge_at");--> statement-breakpoint
ALTER TABLE core_trash ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_trash FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_trash USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
-- A plugin's database role is `erxes_plugin_<name>`: the plugin calling, as
-- the database sees it (SET ROLE, or the login). NULL for other roles (core,
-- the owner, tests), which name the plugin themselves.
CREATE OR REPLACE FUNCTION core_plugin_caller() RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT substring(coalesce(nullif(current_setting('role', true), 'none'), session_user::text) from '^erxes_plugin_([a-z][a-z0-9_]*)$')
$$;
--> statement-breakpoint
-- Plugins can't act in another plugin's name: a plugin role may only pass its own name.
CREATE OR REPLACE FUNCTION core_enter_org(p_org_id text, p_plugin text) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  v_current text := nullif(current_setting('app.org_id', true), '');
  v_caller text := core_plugin_caller();
BEGIN
  IF v_caller IS NOT NULL AND v_caller <> p_plugin THEN
    RAISE EXCEPTION 'this database role is plugin %, not %', v_caller, p_plugin;
  END IF;
  IF coalesce(current_setting('app.system', true), '') <> 'on' THEN
    IF v_current IS NULL THEN
      PERFORM set_config('app.org_id', p_org_id, true);
    ELSIF v_current <> p_org_id THEN
      RAISE EXCEPTION 'this transaction works for organisation %, not %', v_current, p_org_id;
    END IF;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM core_plugin_installations i JOIN core_plugins p ON p.name = i.plugin
    WHERE i.org_id = p_org_id AND i.plugin = p_plugin AND i.status = 'active' AND p.status = 'active'
  ) THEN
    RAISE EXCEPTION '% is not installed in organisation %', p_plugin, p_org_id;
  END IF;
END $$;
--> statement-breakpoint
-- The three ways a plugin on this database reaches core run with the owner's
-- rights (SECURITY DEFINER), so plugin roles need no rights on core tables at
-- all. Only roles granted them (plugin roles, by `pnpm db:plugin-role`) may
-- call them — not PUBLIC (on Supabase that would include the web API's roles).
DO $$
DECLARE
  f regprocedure;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN ('core_publish_event', 'core_record_audit', 'core_live_signal')
  LOOP
    EXECUTE format('ALTER FUNCTION %s SECURITY DEFINER SET search_path = public, pg_temp', f);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', f);
  END LOOP;
END $$;
--> statement-breakpoint
-- Row level security for a plugin's own tables, like core's: rows of one
-- organisation per transaction (`app.org_id`). Run by the plugin, which owns them:
--   SELECT core_enable_tenant_rls('hr_employees');
CREATE OR REPLACE FUNCTION core_enable_tenant_rls(p_table regclass, p_column text DEFAULT 'org_id') RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  IF p_column !~ '^[a-z_][a-z0-9_]*$' THEN
    RAISE EXCEPTION 'core_enable_tenant_rls: invalid column %', p_column;
  END IF;
  EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', p_table);
  EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', p_table);
  EXECUTE format('DROP POLICY IF EXISTS tenant ON %s', p_table);
  EXECUTE format('CREATE POLICY tenant ON %s USING (core_tenant_visible(%I)) WITH CHECK (core_tenant_visible(%I))', p_table, p_column, p_column);
END $$;
