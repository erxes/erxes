CREATE TABLE "core_field_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"content_type" text NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_field_groups_content_type_check" CHECK ("core_field_groups"."content_type" IN ('customer', 'company'))
);
--> statement-breakpoint
ALTER TABLE "core_fields" DROP CONSTRAINT "core_fields_type_check";--> statement-breakpoint
ALTER TABLE "core_fields" ADD COLUMN "group_id" text;--> statement-breakpoint
ALTER TABLE "core_fields" ADD COLUMN "code" text;--> statement-breakpoint
ALTER TABLE "core_fields" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "core_fields" ADD COLUMN "icon" text;--> statement-breakpoint
ALTER TABLE "core_fields" ADD COLUMN "validation" text;--> statement-breakpoint
ALTER TABLE "core_fields" ADD COLUMN "is_visible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "core_fields" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core_field_groups" ADD CONSTRAINT "core_field_groups_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_field_groups_org_type_code_key" ON "core_field_groups" USING btree ("org_id","content_type",lower("code"));--> statement-breakpoint
CREATE INDEX "core_field_groups_org_type_idx" ON "core_field_groups" USING btree ("org_id","content_type","order");--> statement-breakpoint
ALTER TABLE "core_fields" ADD CONSTRAINT "core_fields_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."core_field_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_fields_org_type_code_key" ON "core_fields" USING btree ("org_id","content_type",lower("code")) WHERE "core_fields"."code" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_fields_group_id_idx" ON "core_fields" USING btree ("group_id");--> statement-breakpoint
ALTER TABLE "core_fields" ADD CONSTRAINT "core_fields_validation_check" CHECK ("core_fields"."validation" IS NULL OR "core_fields"."validation" IN ('number', 'email', 'date'));--> statement-breakpoint
ALTER TABLE "core_fields" ADD CONSTRAINT "core_fields_type_check" CHECK ("core_fields"."type" IN ('text', 'textarea', 'number', 'date', 'boolean', 'select', 'multiselect', 'radio', 'check', 'phone', 'list'));