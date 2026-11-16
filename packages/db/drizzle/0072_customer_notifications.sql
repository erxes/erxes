CREATE TABLE "core_customer_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"customer_id" text NOT NULL,
	"source" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"link" text,
	"entity_type" text,
	"entity_id" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"channels" text[] DEFAULT '{}'::text[] NOT NULL,
	"dedupe_key" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core_customer_notifications" ADD CONSTRAINT "core_customer_notifications_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_notifications" ADD CONSTRAINT "core_customer_notifications_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."core_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_customer_notifications_customer_created_idx" ON "core_customer_notifications" USING btree ("customer_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_customer_notifications_unread_idx" ON "core_customer_notifications" USING btree ("customer_id") WHERE "core_customer_notifications"."read_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "core_customer_notifications_dedupe_key" ON "core_customer_notifications" USING btree ("org_id","customer_id","dedupe_key") WHERE "core_customer_notifications"."dedupe_key" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_customer_notifications_read_at_idx" ON "core_customer_notifications" USING btree ("read_at") WHERE "core_customer_notifications"."read_at" IS NOT NULL;--> statement-breakpoint
ALTER TABLE core_customer_notifications ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_customer_notifications FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_customer_notifications USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
