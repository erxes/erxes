ALTER TABLE "core_api_keys" ADD COLUMN "kind" text DEFAULT 'member' NOT NULL;--> statement-breakpoint
ALTER TABLE "core_api_keys" ADD COLUMN "areas" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "core_api_keys" ADD COLUMN "plugin_access" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "core_api_keys" ADD COLUMN "actions" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "core_api_keys" ADD COLUMN "own_records" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "core_api_keys" ADD COLUMN "unit_ids" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "core_api_keys" ADD COLUMN "tag_ids" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "core_api_keys" ADD COLUMN "allowed_ips" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "core_api_keys" ADD COLUMN "permissions" text[];--> statement-breakpoint
ALTER TABLE "core_api_keys" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core_api_keys" ADD CONSTRAINT "core_api_keys_kind_check" CHECK ("core_api_keys"."kind" IN ('member', 'regular', 'management'));--> statement-breakpoint
ALTER TABLE "core_api_keys" ADD CONSTRAINT "core_api_keys_rules_check" CHECK ("core_api_keys"."kind" = 'member' OR "core_api_keys"."permissions" IS NOT NULL);--> statement-breakpoint
ALTER TABLE "core_api_keys" ADD CONSTRAINT "core_api_keys_management_expires_check" CHECK ("core_api_keys"."kind" <> 'management' OR "core_api_keys"."expires_at" IS NOT NULL);--> statement-breakpoint
ALTER TABLE "core_api_keys" ADD CONSTRAINT "core_api_keys_plugin_access_check" CHECK ("core_api_keys"."kind" = 'regular' OR "core_api_keys"."plugin_access" = '{}'::jsonb);--> statement-breakpoint
CREATE FUNCTION core_key_list(name text) RETURNS text[] LANGUAGE sql STABLE AS $$
  SELECT CASE WHEN coalesce(current_setting(name, true), '') = '' THEN NULL ELSE string_to_array(current_setting(name, true), ',') END
$$;
--> statement-breakpoint
CREATE FUNCTION core_key_owner_visible(owner text) RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT core_key_list('app.key_owners') IS NULL OR coalesce(owner = ANY (core_key_list('app.key_owners')), false)
$$;
--> statement-breakpoint
CREATE POLICY core_api_key_rows ON core_customers AS RESTRICTIVE
  USING (
    core_key_owner_visible(owner_id)
    AND (core_key_list('app.key_tags') IS NULL OR EXISTS (
      SELECT 1 FROM core_customer_tags t
      WHERE t.customer_id = core_customers.id AND t.tag_id = ANY (core_key_list('app.key_tags'))
    ))
  )
  WITH CHECK (core_key_owner_visible(owner_id));
--> statement-breakpoint
CREATE POLICY core_api_key_rows ON core_companies AS RESTRICTIVE
  USING (
    core_key_owner_visible(owner_id)
    AND (core_key_list('app.key_tags') IS NULL OR EXISTS (
      SELECT 1 FROM core_company_tags t
      WHERE t.company_id = core_companies.id AND t.tag_id = ANY (core_key_list('app.key_tags'))
    ))
  )
  WITH CHECK (core_key_owner_visible(owner_id));
