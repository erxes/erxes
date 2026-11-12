CREATE TABLE "core_audit_streams" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"format" text DEFAULT 'erxes' NOT NULL,
	"secret_sealed" text NOT NULL,
	"auth_header_name" text,
	"auth_header_value_sealed" text,
	"status" text DEFAULT 'active' NOT NULL,
	"cursor_seq" bigint DEFAULT 0 NOT NULL,
	"chain_id" text,
	"last_delivered_at" timestamp with time zone,
	"last_error" text,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_audit_streams_format_check" CHECK ("core_audit_streams"."format" IN ('erxes', 'datadog', 'splunk')),
	CONSTRAINT "core_audit_streams_status_check" CHECK ("core_audit_streams"."status" IN ('active', 'paused'))
);
--> statement-breakpoint
ALTER TABLE "core_audit_streams" ADD CONSTRAINT "core_audit_streams_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_audit_streams_org_idx" ON "core_audit_streams" USING btree ("org_id");--> statement-breakpoint
ALTER TABLE core_audit_streams ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_audit_streams FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_audit_streams USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
