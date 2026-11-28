CREATE TABLE "core_data_plugins" (
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"plugin" text NOT NULL,
	"connected_by" text,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_data_plugins_pkey" PRIMARY KEY("org_id","plugin")
);
--> statement-breakpoint
ALTER TABLE "core_data_fields" DROP CONSTRAINT "core_data_fields_type_check";--> statement-breakpoint
ALTER TABLE "core_data_plugins" ADD CONSTRAINT "core_data_plugins_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_data_fields" ADD CONSTRAINT "core_data_fields_type_check" CHECK ("core_data_fields"."type" IN ('text', 'longText', 'number', 'percent', 'currency', 'rating', 'boolean', 'date', 'dateTime', 'select', 'multiSelect', 'email', 'phone', 'url', 'emails', 'phones', 'links', 'fullName', 'address', 'member', 'files', 'relation', 'json', 'autoNumber', 'formula', 'rollup'));--> statement-breakpoint
ALTER TABLE core_data_plugins ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE core_data_plugins FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY core_tenant ON core_data_plugins USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));--> statement-breakpoint
-- Auto numbers keep their counter in a bigint column.
CREATE OR REPLACE FUNCTION core_data_add_column(
  p_table text, p_column text, p_type text, p_indexed boolean DEFAULT false
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_schema text := public.core_data_scope_schema();
BEGIN
  PERFORM public.core_data_check_table(p_table);
  PERFORM public.core_data_check_column(p_column);
  IF p_type NOT IN ('text', 'text[]', 'numeric', 'smallint', 'boolean', 'date', 'timestamptz', 'jsonb', 'bigint') THEN
    RAISE EXCEPTION 'core_data: invalid column type %', p_type;
  END IF;
  EXECUTE format('ALTER TABLE %I.%I ADD COLUMN %I %s', v_schema, p_table, p_column, p_type);
  IF p_indexed THEN
    EXECUTE format('CREATE INDEX %I ON %I.%I (%I)',
      p_table || '_' || public.core_data_suffix(p_column) || '_idx', v_schema, p_table, p_column);
  END IF;
END $$;