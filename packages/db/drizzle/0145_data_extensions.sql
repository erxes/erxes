CREATE TABLE "core_data_fields" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"record_type" text NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"icon" text,
	"type" text NOT NULL,
	"column" text,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"relation" jsonb,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_data_fields_type_check" CHECK ("core_data_fields"."type" IN ('text', 'longText', 'number', 'percent', 'currency', 'rating', 'boolean', 'date', 'dateTime', 'select', 'multiSelect', 'email', 'phone', 'url', 'emails', 'phones', 'links', 'fullName', 'address', 'member', 'files', 'relation', 'json')),
	CONSTRAINT "core_data_fields_status_check" CHECK ("core_data_fields"."status" IN ('active', 'archived'))
);
--> statement-breakpoint
CREATE TABLE "core_data_objects" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"key" text NOT NULL,
	"singular_label" text NOT NULL,
	"plural_label" text NOT NULL,
	"description" text,
	"icon" text,
	"label_field_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_data_objects_status_check" CHECK ("core_data_objects"."status" IN ('active', 'archived'))
);
--> statement-breakpoint
CREATE TABLE "core_data_tables" (
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"record_type" text NOT NULL,
	"table_name" text NOT NULL,
	"kind" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_data_tables_pkey" PRIMARY KEY("org_id","record_type"),
	CONSTRAINT "core_data_tables_kind_check" CHECK ("core_data_tables"."kind" IN ('object', 'host', 'pairs'))
);
--> statement-breakpoint
ALTER TABLE "core_data_fields" ADD CONSTRAINT "core_data_fields_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_data_objects" ADD CONSTRAINT "core_data_objects_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_data_tables" ADD CONSTRAINT "core_data_tables_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_data_fields_org_type_key_key" ON "core_data_fields" USING btree ("org_id","record_type","key");--> statement-breakpoint
CREATE UNIQUE INDEX "core_data_fields_org_type_column_key" ON "core_data_fields" USING btree ("org_id","record_type","column");--> statement-breakpoint
CREATE INDEX "core_data_fields_org_type_position_idx" ON "core_data_fields" USING btree ("org_id","record_type","position");--> statement-breakpoint
CREATE UNIQUE INDEX "core_data_objects_org_key_key" ON "core_data_objects" USING btree ("org_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "core_data_tables_org_table_key" ON "core_data_tables" USING btree ("org_id","table_name");--> statement-breakpoint
ALTER TABLE core_data_objects ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE core_data_objects FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY core_tenant ON core_data_objects USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));--> statement-breakpoint
ALTER TABLE core_data_tables ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE core_data_tables FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY core_tenant ON core_data_tables USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));--> statement-breakpoint
ALTER TABLE core_data_fields ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE core_data_fields FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY core_tenant ON core_data_fields USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));--> statement-breakpoint
-- Data Extensions keeps an organisation's records in its own schema, `data_<org id>`: a table
-- per custom object (`obj_<key>`), per core or plugin record type it extends
-- (`ext_<plugin>_<type>`) and per many-to-many relation (`rel_<id>`), and a column per field,
-- made while the app runs, as Twenty does. The runtime role can't change tables, so these
-- functions do it as the owner, one narrow change each:
--   * only in the schema of the organisation in scope (`withOrg` sets app.org_id), so a
--     request can't touch another organisation's tables;
--   * only on names that match the patterns below, quoted, with types from a fixed list;
--   * with pg_catalog alone on the search path, so a function a plugin puts in public can't
--     stand in for a built-in they call.
-- Every table they make has org_id with forced row level security and the tenant policy, as
-- core's own tables do. erxes_core_data holds the rights to call them and to use the tables;
-- the runtime role and erxes_core_system hold erxes_core_data, plugin roles never do.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'erxes_core_data') THEN
    CREATE ROLE erxes_core_data NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
END $$;
--> statement-breakpoint
-- The schema of the organisation in scope, made on first use.
CREATE OR REPLACE FUNCTION core_data_scope_schema() RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_org text := nullif(current_setting('app.org_id', true), '');
  v_schema text;
BEGIN
  IF v_org IS NULL OR v_org !~ '^[A-Za-z0-9_-]{1,40}$' THEN
    RAISE EXCEPTION 'core_data: no organisation in scope';
  END IF;
  v_schema := 'data_' || v_org;
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = v_schema) THEN
    EXECUTE format('CREATE SCHEMA %I', v_schema);
    EXECUTE format('GRANT USAGE ON SCHEMA %I TO erxes_core_data', v_schema);
  END IF;
  RETURN v_schema;
END $$;
--> statement-breakpoint
-- A table name these functions accept: a kind's prefix, lower case, short enough that its
-- index names (`<table>_<suffix>`) stay within Postgres's 63 characters.
CREATE OR REPLACE FUNCTION core_data_check_table(p_table text) RETURNS void
LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF p_table IS NULL OR p_table !~ '^(obj|ext|rel)_[a-z][a-z0-9_]{0,43}$' THEN
    RAISE EXCEPTION 'core_data: invalid table name %', p_table;
  END IF;
END $$;
--> statement-breakpoint
-- A field column these functions accept: lower case, and none of the columns they make.
CREATE OR REPLACE FUNCTION core_data_check_column(p_column text) RETURNS void
LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF p_column IS NULL OR p_column !~ '^[a-z][a-z0-9_]{0,62}$' OR p_column IN (
    'id', 'org_id', 'position', 'search', 'created_by', 'updated_by', 'created_at',
    'updated_at', 'deleted_at', 'record_id', 'source_id', 'target_id'
  ) THEN
    RAISE EXCEPTION 'core_data: invalid column name %', p_column;
  END IF;
END $$;
--> statement-breakpoint
-- The part of an index's or key's name that a column gives it: 8 hex digits of its sha256, so
-- names stay short; the API computes the same to tell which field a violation is about.
CREATE OR REPLACE FUNCTION core_data_suffix(p_column text) RETURNS text
LANGUAGE sql IMMUTABLE SET search_path = pg_catalog, pg_temp AS $$
  SELECT left(encode(sha256(convert_to(p_column, 'UTF8')), 'hex'), 8)
$$;
--> statement-breakpoint
-- A new table: a custom object's records (`object`), a record type's values (`host`) or a
-- many-to-many relation's pairs (`pairs`).
CREATE OR REPLACE FUNCTION core_data_create_table(p_table text, p_kind text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_schema text := public.core_data_scope_schema();
  v_org_id text := $d$org_id text NOT NULL DEFAULT nullif(current_setting('app.org_id', true), '')$d$;
BEGIN
  PERFORM public.core_data_check_table(p_table);
  CASE p_kind
    WHEN 'object' THEN
      EXECUTE format(
        'CREATE TABLE %I.%I (id text PRIMARY KEY, %s, position double precision NOT NULL DEFAULT 0, '
        'search tsvector, created_by text, updated_by text, '
        'created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), '
        'deleted_at timestamptz)',
        v_schema, p_table, v_org_id);
      EXECUTE format('CREATE INDEX %I ON %I.%I USING gin (search)', p_table || '_search_idx', v_schema, p_table);
      EXECUTE format('CREATE INDEX %I ON %I.%I (created_at, id)', p_table || '_created_idx', v_schema, p_table);
    WHEN 'host' THEN
      EXECUTE format(
        'CREATE TABLE %I.%I (record_id text PRIMARY KEY, %s, updated_by text, '
        'updated_at timestamptz NOT NULL DEFAULT now())',
        v_schema, p_table, v_org_id);
    WHEN 'pairs' THEN
      EXECUTE format(
        'CREATE TABLE %I.%I (source_id text NOT NULL, target_id text NOT NULL, %s, '
        'created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (source_id, target_id))',
        v_schema, p_table, v_org_id);
      EXECUTE format('CREATE INDEX %I ON %I.%I (target_id, source_id)', p_table || '_target_idx', v_schema, p_table);
    ELSE
      RAISE EXCEPTION 'core_data: invalid table kind %', p_kind;
  END CASE;
  EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', v_schema, p_table);
  EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY', v_schema, p_table);
  EXECUTE format(
    'CREATE POLICY core_tenant ON %I.%I USING (public.core_tenant_visible(org_id)) '
    'WITH CHECK (public.core_tenant_visible(org_id))',
    v_schema, p_table);
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I.%I TO erxes_core_data', v_schema, p_table);
END $$;
--> statement-breakpoint
-- Drops a table and the references other tables make to it.
CREATE OR REPLACE FUNCTION core_data_drop_table(p_table text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_schema text := public.core_data_scope_schema();
BEGIN
  PERFORM public.core_data_check_table(p_table);
  EXECUTE format('DROP TABLE IF EXISTS %I.%I CASCADE', v_schema, p_table);
END $$;
--> statement-breakpoint
-- A field's column, of one of Data Extensions' column types; `p_indexed` adds a btree index,
-- for a relation's id column.
CREATE OR REPLACE FUNCTION core_data_add_column(
  p_table text, p_column text, p_type text, p_indexed boolean DEFAULT false
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_schema text := public.core_data_scope_schema();
BEGIN
  PERFORM public.core_data_check_table(p_table);
  PERFORM public.core_data_check_column(p_column);
  IF p_type NOT IN ('text', 'text[]', 'numeric', 'smallint', 'boolean', 'date', 'timestamptz', 'jsonb') THEN
    RAISE EXCEPTION 'core_data: invalid column type %', p_type;
  END IF;
  EXECUTE format('ALTER TABLE %I.%I ADD COLUMN %I %s', v_schema, p_table, p_column, p_type);
  IF p_indexed THEN
    EXECUTE format('CREATE INDEX %I ON %I.%I (%I)',
      p_table || '_' || public.core_data_suffix(p_column) || '_idx', v_schema, p_table, p_column);
  END IF;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION core_data_rename_column(p_table text, p_from text, p_to text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_schema text := public.core_data_scope_schema();
BEGIN
  PERFORM public.core_data_check_table(p_table);
  PERFORM public.core_data_check_column(p_from);
  PERFORM public.core_data_check_column(p_to);
  EXECUTE format('ALTER TABLE %I.%I RENAME COLUMN %I TO %I', v_schema, p_table, p_from, p_to);
END $$;
--> statement-breakpoint
-- Drops a field's column, with its indexes and references.
CREATE OR REPLACE FUNCTION core_data_drop_column(p_table text, p_column text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_schema text := public.core_data_scope_schema();
BEGIN
  PERFORM public.core_data_check_table(p_table);
  PERFORM public.core_data_check_column(p_column);
  EXECUTE format('ALTER TABLE %I.%I DROP COLUMN IF EXISTS %I', v_schema, p_table, p_column);
END $$;
--> statement-breakpoint
-- A unique field: no two rows share a value. On a custom object's table only the records in
-- use count, so a record in the recycle bin doesn't hold its value.
CREATE OR REPLACE FUNCTION core_data_set_unique(p_table text, p_column text, p_unique boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_schema text := public.core_data_scope_schema();
  v_index text := p_table || '_' || public.core_data_suffix(p_column) || '_key';
BEGIN
  PERFORM public.core_data_check_table(p_table);
  PERFORM public.core_data_check_column(p_column);
  IF NOT p_unique THEN
    EXECUTE format('DROP INDEX IF EXISTS %I.%I', v_schema, v_index);
  ELSIF p_table LIKE 'obj\_%' THEN
    EXECUTE format('CREATE UNIQUE INDEX %I ON %I.%I (%I) WHERE deleted_at IS NULL',
      v_index, v_schema, p_table, p_column);
  ELSE
    EXECUTE format('CREATE UNIQUE INDEX %I ON %I.%I (%I)', v_index, v_schema, p_table, p_column);
  END IF;
END $$;
--> statement-breakpoint
-- A link to a custom object's records: a foreign key from `p_column` (`source_id` or
-- `target_id` of a pairs table, or a field's id column) to the target table's id.
CREATE OR REPLACE FUNCTION core_data_add_reference(
  p_table text, p_column text, p_target text, p_on_delete text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_schema text := public.core_data_scope_schema();
BEGIN
  PERFORM public.core_data_check_table(p_table);
  PERFORM public.core_data_check_table(p_target);
  IF p_target NOT LIKE 'obj\_%' THEN
    RAISE EXCEPTION 'core_data: % holds no custom records', p_target;
  END IF;
  IF p_column NOT IN ('source_id', 'target_id') THEN
    PERFORM public.core_data_check_column(p_column);
  END IF;
  IF p_on_delete NOT IN ('setNull', 'cascade') THEN
    RAISE EXCEPTION 'core_data: invalid delete rule %', p_on_delete;
  END IF;
  EXECUTE format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I (id) ON DELETE %s',
    v_schema, p_table, p_table || '_' || public.core_data_suffix(p_column) || '_fkey', p_column,
    v_schema, p_target, CASE p_on_delete WHEN 'cascade' THEN 'CASCADE' ELSE 'SET NULL' END);
END $$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION core_data_scope_schema(), core_data_check_table(text),
  core_data_check_column(text), core_data_suffix(text), core_data_create_table(text, text),
  core_data_drop_table(text),
  core_data_add_column(text, text, text, boolean), core_data_rename_column(text, text, text),
  core_data_drop_column(text, text), core_data_set_unique(text, text, boolean),
  core_data_add_reference(text, text, text, text) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION core_data_scope_schema(), core_data_create_table(text, text),
  core_data_drop_table(text), core_data_add_column(text, text, text, boolean),
  core_data_rename_column(text, text, text), core_data_drop_column(text, text),
  core_data_set_unique(text, text, boolean), core_data_add_reference(text, text, text, text)
  TO erxes_core_data;
--> statement-breakpoint
-- The runtime role (and erxes_core_system) hold erxes_core_data, as they do erxes_core_reader.
CREATE OR REPLACE FUNCTION core_grant_runtime(p_role text) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM core_grant_data(p_role);
  PERFORM core_grant_data('erxes_core_system');
  EXECUTE format('GRANT erxes_core_system TO %I WITH INHERIT FALSE, SET TRUE', p_role);
  EXECUTE format('GRANT erxes_core_reader TO %I WITH INHERIT TRUE', p_role);
  GRANT erxes_core_reader TO erxes_core_system WITH INHERIT TRUE;
  EXECUTE format('GRANT erxes_core_data TO %I WITH INHERIT TRUE', p_role);
  GRANT erxes_core_data TO erxes_core_system WITH INHERIT TRUE;
END $$;
--> statement-breakpoint
-- Runtime roles granted before this migration: those that may become erxes_core_system.
DO $$
DECLARE
  r text;
BEGIN
  GRANT erxes_core_data TO erxes_core_system WITH INHERIT TRUE;
  EXECUTE format('GRANT erxes_core_data TO %I WITH INHERIT TRUE', current_user);

  FOR r IN
    SELECT member::regrole::text FROM pg_auth_members
    WHERE roleid = 'erxes_core_system'::regrole AND member <> current_user::regrole
  LOOP
    EXECUTE format('GRANT erxes_core_data TO %s WITH INHERIT TRUE', r);
  END LOOP;
END $$;