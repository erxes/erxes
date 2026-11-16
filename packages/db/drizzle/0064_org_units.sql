CREATE TABLE "core_org_unit_members" (
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"unit_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_org_unit_members_pkey" PRIMARY KEY("unit_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "core_org_units" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"parent_id" text,
	"path" text NOT NULL,
	"supervisor_id" text,
	"description" text,
	"address" text,
	"phone" text,
	"email" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_org_units_kind_check" CHECK ("core_org_units"."kind" IN ('branch', 'department')),
	CONSTRAINT "core_org_units_path_check" CHECK ("core_org_units"."path" LIKE '%/' || "core_org_units"."id" || '/')
);
--> statement-breakpoint
CREATE UNIQUE INDEX "core_org_units_org_id_kind_key" ON "core_org_units" USING btree ("org_id","id","kind");--> statement-breakpoint
ALTER TABLE "core_org_unit_members" ADD CONSTRAINT "core_org_unit_members_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."core_org_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_org_unit_members" ADD CONSTRAINT "core_org_unit_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."core_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_org_unit_members" ADD CONSTRAINT "core_org_unit_members_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_org_units" ADD CONSTRAINT "core_org_units_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_org_units" ADD CONSTRAINT "core_org_units_parent_fkey" FOREIGN KEY ("org_id","parent_id","kind") REFERENCES "public"."core_org_units"("org_id","id","kind") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_org_units" ADD CONSTRAINT "core_org_units_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "public"."core_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_org_unit_members_org_user_idx" ON "core_org_unit_members" USING btree ("org_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "core_org_units_org_kind_code_key" ON "core_org_units" USING btree ("org_id","kind",lower("code")) WHERE "core_org_units"."code" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_org_units_org_kind_path_idx" ON "core_org_units" USING btree ("org_id","kind","path" text_pattern_ops);--> statement-breakpoint
CREATE INDEX "core_org_units_supervisor_idx" ON "core_org_units" USING btree ("supervisor_id") WHERE "core_org_units"."supervisor_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE core_org_units ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_org_units FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_org_units USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_org_unit_members ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_org_unit_members FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_org_unit_members USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
