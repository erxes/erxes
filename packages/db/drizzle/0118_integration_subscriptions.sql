CREATE TABLE "core_integration_oauth_apps" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"key" text NOT NULL,
	"secret_id" text NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_integration_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"connection_id" text NOT NULL,
	"app" text NOT NULL,
	"channel" text NOT NULL,
	"params" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"params_key" text NOT NULL,
	"triggers" text[] DEFAULT '{}'::text[] NOT NULL,
	"status" text DEFAULT 'syncing' NOT NULL,
	"external_id" text,
	"route_key" text,
	"secret_id" text NOT NULL,
	"cursor" jsonb,
	"next_poll_at" timestamp with time zone,
	"failures" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"last_delivery_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_integration_subscriptions_status_check" CHECK ("core_integration_subscriptions"."status" IN ('syncing', 'listening', 'broken'))
);
--> statement-breakpoint
ALTER TABLE "core_automations" ADD COLUMN "subscription_id" text;--> statement-breakpoint
ALTER TABLE "core_integration_connections" ADD COLUMN "auth" text DEFAULT 'keys' NOT NULL;--> statement-breakpoint
ALTER TABLE "core_integration_oauth_apps" ADD CONSTRAINT "core_integration_oauth_apps_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_integration_oauth_apps" ADD CONSTRAINT "core_integration_oauth_apps_secret_id_fkey" FOREIGN KEY ("secret_id") REFERENCES "public"."core_secrets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_integration_subscriptions" ADD CONSTRAINT "core_integration_subscriptions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_integration_subscriptions" ADD CONSTRAINT "core_integration_subscriptions_connection_id_fkey" FOREIGN KEY ("org_id","connection_id") REFERENCES "public"."core_integration_connections"("org_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_integration_subscriptions" ADD CONSTRAINT "core_integration_subscriptions_secret_id_fkey" FOREIGN KEY ("secret_id") REFERENCES "public"."core_secrets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_integration_oauth_apps_org_id_key_key" ON "core_integration_oauth_apps" USING btree ("org_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "core_integration_subscriptions_org_id_id_key" ON "core_integration_subscriptions" USING btree ("org_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "core_integration_subscriptions_identity_key" ON "core_integration_subscriptions" USING btree ("org_id","connection_id","channel","params_key");--> statement-breakpoint
CREATE INDEX "core_integration_subscriptions_due_idx" ON "core_integration_subscriptions" USING btree ("next_poll_at") WHERE "core_integration_subscriptions"."next_poll_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_integration_subscriptions_route_idx" ON "core_integration_subscriptions" USING btree ("app","route_key") WHERE "core_integration_subscriptions"."route_key" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "core_automations" ADD CONSTRAINT "core_automations_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."core_integration_subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_automations_subscription_idx" ON "core_automations" USING btree ("subscription_id") WHERE "core_automations"."subscription_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "core_integration_connections" ADD CONSTRAINT "core_integration_connections_auth_check" CHECK ("core_integration_connections"."auth" IN ('keys', 'oauth'));--> statement-breakpoint
ALTER TABLE core_integration_oauth_apps ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_integration_oauth_apps FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_integration_oauth_apps USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_integration_subscriptions ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_integration_subscriptions FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_integration_subscriptions USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
CREATE TRIGGER core_integration_oauth_apps_drop_secrets AFTER DELETE OR UPDATE OF secret_id ON core_integration_oauth_apps
  FOR EACH ROW EXECUTE FUNCTION core_drop_secrets('secret_id');
--> statement-breakpoint
CREATE TRIGGER core_integration_subscriptions_drop_secrets AFTER DELETE OR UPDATE OF secret_id ON core_integration_subscriptions
  FOR EACH ROW EXECUTE FUNCTION core_drop_secrets('secret_id');

