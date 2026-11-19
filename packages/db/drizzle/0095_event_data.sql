CREATE TABLE "core_event_data" (
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"type" text NOT NULL,
	"key" text NOT NULL,
	"kind" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_event_data_pkey" PRIMARY KEY("org_id","type","key"),
	CONSTRAINT "core_event_data_kind_check" CHECK ("core_event_data"."kind" IN ('seen', 'text', 'number', 'boolean', 'list'))
);
--> statement-breakpoint
ALTER TABLE "core_event_data" ADD CONSTRAINT "core_event_data_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_event_data" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "core_event_data" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY core_tenant ON "core_event_data" USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
