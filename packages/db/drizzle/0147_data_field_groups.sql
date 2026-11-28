CREATE TABLE "core_data_field_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"record_type" text NOT NULL,
	"label" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"position" integer DEFAULT 0 NOT NULL,
	"applies_to" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core_data_fields" DROP CONSTRAINT "core_data_fields_type_check";--> statement-breakpoint
ALTER TABLE "core_data_fields" ADD COLUMN "group_id" text;--> statement-breakpoint
ALTER TABLE "core_data_fields" ADD COLUMN "plugin" text;--> statement-breakpoint
ALTER TABLE "core_data_field_groups" ADD CONSTRAINT "core_data_field_groups_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_data_field_groups_org_type_code_key" ON "core_data_field_groups" USING btree ("org_id","record_type",lower("code"));--> statement-breakpoint
CREATE INDEX "core_data_field_groups_org_type_position_idx" ON "core_data_field_groups" USING btree ("org_id","record_type","position");--> statement-breakpoint
ALTER TABLE "core_data_fields" ADD CONSTRAINT "core_data_fields_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."core_data_field_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_data_fields_group_id_idx" ON "core_data_fields" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "core_data_fields_plugin_idx" ON "core_data_fields" USING btree ("plugin") WHERE "core_data_fields"."plugin" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "core_data_fields" ADD CONSTRAINT "core_data_fields_type_check" CHECK ("core_data_fields"."type" IN ('text', 'longText', 'number', 'percent', 'currency', 'rating', 'boolean', 'date', 'dateTime', 'select', 'multiSelect', 'textList', 'email', 'phone', 'url', 'emails', 'phones', 'links', 'fullName', 'address', 'member', 'files', 'relation', 'json', 'autoNumber', 'formula', 'rollup'));--> statement-breakpoint
ALTER TABLE core_data_field_groups ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE core_data_field_groups FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY core_tenant ON core_data_field_groups USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));