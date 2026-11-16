CREATE TABLE "core_org_unit_types" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"description" text,
	"color" text DEFAULT '#64748b' NOT NULL,
	"icon" text,
	"can_be_root" boolean DEFAULT true NOT NULL,
	"allowed_parent_type_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_org_unit_types_kind_check" CHECK ("core_org_unit_types"."kind" IN ('branch', 'department'))
);
--> statement-breakpoint
ALTER TABLE "core_org_unit_types" ADD CONSTRAINT "core_org_unit_types_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_org_unit_types_org_id_kind_key" ON "core_org_unit_types" USING btree ("org_id","id","kind");--> statement-breakpoint
CREATE UNIQUE INDEX "core_org_unit_types_org_kind_code_key" ON "core_org_unit_types" USING btree ("org_id","kind",lower("code")) WHERE "core_org_unit_types"."code" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_org_unit_types_org_kind_order_idx" ON "core_org_unit_types" USING btree ("org_id","kind","sort_order");--> statement-breakpoint
ALTER TABLE core_org_unit_types ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_org_unit_types FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_org_unit_types USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON core_org_unit_types TO erxes_core_system;
--> statement-breakpoint
ALTER TABLE "core_org_units" ADD COLUMN "type_id" text;--> statement-breakpoint
-- Every organisation starts with a Branch and a Department type, and its units so far get the
-- one of their kind. Across organisations, so as erxes_core_system, which row security lets through.
DO $$ BEGIN
  IF pg_has_role(current_user, 'erxes_core_system', 'SET') THEN
    SET LOCAL ROLE erxes_core_system;
  END IF;

  INSERT INTO core_org_unit_types (id, org_id, kind, name, code, color, icon)
  SELECT substr(md5(random()::text || o.id || t.kind), 1, 17), o.id, t.kind, t.name, t.kind, t.color, t.icon
  FROM core_organizations o
  CROSS JOIN (VALUES ('branch', 'Branch', '#0ea5e9', 'IconBuildingStore'), ('department', 'Department', '#6366f1', 'IconSitemap')) AS t (kind, name, color, icon);

  UPDATE core_org_units u SET type_id = t.id
  FROM core_org_unit_types t WHERE t.org_id = u.org_id AND t.kind = u.kind;

  RESET ROLE;
END $$;
--> statement-breakpoint
ALTER TABLE "core_org_units" ALTER COLUMN "type_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "core_org_units" ADD CONSTRAINT "core_org_units_type_fkey" FOREIGN KEY ("org_id","type_id","kind") REFERENCES "public"."core_org_unit_types"("org_id","id","kind") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_org_units_org_type_idx" ON "core_org_units" USING btree ("org_id","type_id");
