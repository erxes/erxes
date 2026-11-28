ALTER TABLE "core_websites" RENAME TO "core_portals";--> statement-breakpoint
ALTER TABLE "core_portals" RENAME CONSTRAINT "core_websites_pkey" TO "core_portals_pkey";--> statement-breakpoint
ALTER TABLE "core_portals" RENAME CONSTRAINT "core_websites_org_id_fkey" TO "core_portals_org_id_fkey";--> statement-breakpoint
ALTER INDEX "core_websites_origins_idx" RENAME TO "core_portals_origins_idx";--> statement-breakpoint
CREATE TABLE "core_portal_plugins" (
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"portal_id" text NOT NULL,
	"plugin" text NOT NULL,
	"record_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_portal_plugins_pkey" PRIMARY KEY("portal_id","plugin")
);
--> statement-breakpoint
-- Each website was one plugin's record: it becomes a portal with that plugin attached.
INSERT INTO "core_portal_plugins" ("org_id", "portal_id", "plugin", "record_id", "created_at")
SELECT "org_id", "id", "plugin", "record_id", "created_at" FROM "core_portals";--> statement-breakpoint
DROP INDEX "core_websites_org_plugin_record_key";--> statement-breakpoint
ALTER TABLE "core_portals" DROP COLUMN "plugin";--> statement-breakpoint
ALTER TABLE "core_portals" DROP COLUMN "record_id";--> statement-breakpoint
ALTER TABLE "core_portals" ADD COLUMN "sender_name" text;--> statement-breakpoint
ALTER TABLE "core_portals" ADD COLUMN "ios_bundle_ids" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "core_portals" ADD COLUMN "android_packages" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "core_portals" ADD COLUMN "email_sign_in" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "core_portals" ADD COLUMN "phone_sign_in" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "core_portals" ADD COLUMN "phone_connection_id" text;--> statement-breakpoint
ALTER TABLE "core_portals" ADD COLUMN "google_connection_id" text;--> statement-breakpoint
ALTER TABLE "core_portals" ADD COLUMN "apple_connection_id" text;--> statement-breakpoint
ALTER TABLE "core_portals" ADD COLUMN "facebook_connection_id" text;--> statement-breakpoint
ALTER TABLE "core_portals" ADD CONSTRAINT "core_portals_phone_connection_id_fkey" FOREIGN KEY ("phone_connection_id") REFERENCES "public"."core_integration_connections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_portals" ADD CONSTRAINT "core_portals_google_connection_id_fkey" FOREIGN KEY ("google_connection_id") REFERENCES "public"."core_integration_connections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_portals" ADD CONSTRAINT "core_portals_apple_connection_id_fkey" FOREIGN KEY ("apple_connection_id") REFERENCES "public"."core_integration_connections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_portals" ADD CONSTRAINT "core_portals_facebook_connection_id_fkey" FOREIGN KEY ("facebook_connection_id") REFERENCES "public"."core_integration_connections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_portals_org_name_idx" ON "core_portals" USING btree ("org_id","name");--> statement-breakpoint
CREATE TABLE "core_portal_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"portal_id" text NOT NULL,
	"name" text NOT NULL,
	"secret_hash" text NOT NULL,
	"hint" text NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "core_portal_keys" ADD CONSTRAINT "core_portal_keys_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_portal_keys" ADD CONSTRAINT "core_portal_keys_portal_id_fkey" FOREIGN KEY ("portal_id") REFERENCES "public"."core_portals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_portal_plugins" ADD CONSTRAINT "core_portal_plugins_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_portal_plugins" ADD CONSTRAINT "core_portal_plugins_portal_id_fkey" FOREIGN KEY ("portal_id") REFERENCES "public"."core_portals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_portal_keys_org_portal_idx" ON "core_portal_keys" USING btree ("org_id","portal_id");--> statement-breakpoint
CREATE UNIQUE INDEX "core_portal_plugins_org_plugin_record_key" ON "core_portal_plugins" USING btree ("org_id","plugin","record_id");--> statement-breakpoint
ALTER TABLE "core_customer_accounts" RENAME COLUMN "website_id" TO "portal_id";--> statement-breakpoint
ALTER TABLE "core_customer_accounts" RENAME CONSTRAINT "core_customer_accounts_website_id_fkey" TO "core_customer_accounts_portal_id_fkey";--> statement-breakpoint
ALTER INDEX "core_customer_accounts_org_website_customer_key" RENAME TO "core_customer_accounts_org_portal_customer_key";--> statement-breakpoint
ALTER INDEX "core_customer_accounts_id_website_key" RENAME TO "core_customer_accounts_id_portal_key";--> statement-breakpoint
ALTER TABLE "core_customer_logins" RENAME COLUMN "website_id" TO "portal_id";--> statement-breakpoint
ALTER INDEX "core_customer_logins_org_website_kind_value_key" RENAME TO "core_customer_logins_org_portal_kind_value_key";--> statement-breakpoint
ALTER TABLE "core_customer_logins" DROP CONSTRAINT "core_customer_logins_kind_check";--> statement-breakpoint
ALTER TABLE "core_customer_logins" ADD CONSTRAINT "core_customer_logins_kind_check" CHECK ("core_customer_logins"."kind" IN ('email', 'phone', 'google', 'apple', 'facebook'));--> statement-breakpoint
ALTER TABLE "core_customer_codes" RENAME COLUMN "website_id" TO "portal_id";--> statement-breakpoint
ALTER TABLE "core_customer_codes" RENAME CONSTRAINT "core_customer_codes_website_id_fkey" TO "core_customer_codes_portal_id_fkey";--> statement-breakpoint
ALTER INDEX "core_customer_codes_org_website_address_idx" RENAME TO "core_customer_codes_org_portal_address_idx";--> statement-breakpoint
ALTER TABLE "core_customer_codes" ADD COLUMN "reply_session_id" text;--> statement-breakpoint
ALTER TABLE "core_customer_notifications" RENAME COLUMN "website_id" TO "portal_id";--> statement-breakpoint
ALTER TABLE "core_customer_notifications" RENAME CONSTRAINT "core_customer_notifications_website_id_fkey" TO "core_customer_notifications_portal_id_fkey";--> statement-breakpoint
ALTER TABLE "core_agents" RENAME COLUMN "website_id" TO "portal_id";--> statement-breakpoint
ALTER TABLE "core_agents" RENAME CONSTRAINT "core_agents_website_id_fkey" TO "core_agents_portal_id_fkey";--> statement-breakpoint
-- Plugins that kept websites keep portals: their granted scope follows the rename.
UPDATE "core_plugin_installations" SET "granted_scopes" = array_replace("granted_scopes", 'websites:write', 'portals:write') WHERE 'websites:write' = ANY("granted_scopes");--> statement-breakpoint
ALTER TABLE core_portal_plugins ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_portal_plugins FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_portal_plugins USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_portal_keys ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_portal_keys FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_portal_keys USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
