CREATE TABLE "core_exports" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"record_type" text NOT NULL,
	"format" text NOT NULL,
	"query" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"columns" jsonb NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"row_count" integer,
	"file_id" text,
	"error" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	CONSTRAINT "core_exports_record_type_check" CHECK ("core_exports"."record_type" IN ('customer', 'lead', 'company')),
	CONSTRAINT "core_exports_format_check" CHECK ("core_exports"."format" IN ('csv', 'xlsx')),
	CONSTRAINT "core_exports_status_check" CHECK ("core_exports"."status" IN ('running', 'done', 'failed'))
);
--> statement-breakpoint
CREATE TABLE "core_import_rows" (
	"org_id" text NOT NULL,
	"import_id" text NOT NULL,
	"row_number" integer NOT NULL,
	"cells" jsonb NOT NULL,
	"action" text,
	"error" text,
	"record_id" text,
	CONSTRAINT "core_import_rows_pkey" PRIMARY KEY("import_id","row_number")
);
--> statement-breakpoint
CREATE TABLE "core_imports" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"record_type" text NOT NULL,
	"file_id" text NOT NULL,
	"file_name" text NOT NULL,
	"status" text DEFAULT 'parsing' NOT NULL,
	"headers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"mapping" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"options" jsonb NOT NULL,
	"counts" jsonb DEFAULT '{"rows":0,"create":0,"update":0,"skip":0,"error":0}'::jsonb NOT NULL,
	"processed" integer DEFAULT 0 NOT NULL,
	"error" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	CONSTRAINT "core_imports_record_type_check" CHECK ("core_imports"."record_type" IN ('customer', 'lead', 'company')),
	CONSTRAINT "core_imports_status_check" CHECK ("core_imports"."status" IN ('parsing', 'mapping', 'checking', 'checked', 'running', 'done', 'failed', 'undone'))
);
--> statement-breakpoint
ALTER TABLE "core_exports" ADD CONSTRAINT "core_exports_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_imports_org_id_id_key" ON "core_imports" USING btree ("org_id","id");--> statement-breakpoint
ALTER TABLE "core_import_rows" ADD CONSTRAINT "core_import_rows_import_fkey" FOREIGN KEY ("org_id","import_id") REFERENCES "public"."core_imports"("org_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_imports" ADD CONSTRAINT "core_imports_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_exports_org_created_idx" ON "core_exports" USING btree ("org_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_import_rows_action_idx" ON "core_import_rows" USING btree ("import_id","action");--> statement-breakpoint
CREATE INDEX "core_imports_org_created_idx" ON "core_imports" USING btree ("org_id","created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE core_imports ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_imports FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_imports USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_import_rows ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_import_rows FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_import_rows USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_exports ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_exports FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_exports USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
