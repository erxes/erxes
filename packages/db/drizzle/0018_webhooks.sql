CREATE TABLE "core_webhook_deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"webhook_id" text NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"response_status" integer,
	"response_body" text,
	"error" text,
	"duration_ms" integer,
	"next_attempt_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_webhook_deliveries_status_check" CHECK ("core_webhook_deliveries"."status" IN ('pending', 'succeeded', 'failed'))
);
--> statement-breakpoint
CREATE TABLE "core_webhooks" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"event_types" text[] NOT NULL,
	"secret_sealed" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"disabled_reason" text,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_webhooks_status_check" CHECK ("core_webhooks"."status" IN ('active', 'disabled'))
);
--> statement-breakpoint
ALTER TABLE "core_webhook_deliveries" ADD CONSTRAINT "core_webhook_deliveries_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_webhook_deliveries" ADD CONSTRAINT "core_webhook_deliveries_webhook_id_fkey" FOREIGN KEY ("webhook_id") REFERENCES "public"."core_webhooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_webhooks" ADD CONSTRAINT "core_webhooks_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_webhook_deliveries_webhook_idx" ON "core_webhook_deliveries" USING btree ("org_id","webhook_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_webhook_deliveries_created_idx" ON "core_webhook_deliveries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "core_webhooks_org_idx" ON "core_webhooks" USING btree ("org_id","status");--> statement-breakpoint
ALTER TABLE core_webhooks ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_webhooks FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_webhooks USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_webhook_deliveries ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_webhook_deliveries FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_webhook_deliveries USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
CREATE UNIQUE INDEX core_webhooks_org_id_id_key ON core_webhooks (org_id, id);
--> statement-breakpoint
ALTER TABLE core_webhook_deliveries ADD CONSTRAINT core_webhook_deliveries_webhook_org_fkey
  FOREIGN KEY (org_id, webhook_id) REFERENCES core_webhooks (org_id, id) ON DELETE CASCADE;
