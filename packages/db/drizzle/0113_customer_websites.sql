-- Sign-in moves from the organisation to its websites: logins, codes and sessions made without
-- one have no website to belong to. Customers keep their emails and phones and sign in again.
DELETE FROM "core_customer_sessions";--> statement-breakpoint
DELETE FROM "core_customer_codes";--> statement-breakpoint
DELETE FROM "core_customer_logins";--> statement-breakpoint
CREATE TABLE "core_customer_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"website_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_signed_in_at" timestamp with time zone,
	CONSTRAINT "core_customer_accounts_status_check" CHECK ("core_customer_accounts"."status" IN ('active', 'blocked'))
);
--> statement-breakpoint
CREATE TABLE "core_websites" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"plugin" text NOT NULL,
	"record_id" text NOT NULL,
	"name" text NOT NULL,
	"origins" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core_customer_codes" DROP CONSTRAINT "core_customer_codes_customer_id_fkey";
--> statement-breakpoint
ALTER TABLE "core_customer_logins" DROP CONSTRAINT "core_customer_logins_customer_id_fkey";
--> statement-breakpoint
ALTER TABLE "core_customer_sessions" DROP CONSTRAINT "core_customer_sessions_customer_id_fkey";
--> statement-breakpoint
DROP INDEX "core_customer_codes_org_address_idx";--> statement-breakpoint
DROP INDEX "core_customer_logins_org_kind_value_key";--> statement-breakpoint
DROP INDEX "core_customer_logins_org_customer_idx";--> statement-breakpoint
DROP INDEX "core_customer_sessions_org_customer_idx";--> statement-breakpoint
ALTER TABLE "core_customer_codes" ADD COLUMN "website_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "core_customer_codes" ADD COLUMN "account_id" text;--> statement-breakpoint
ALTER TABLE "core_customer_logins" ADD COLUMN "account_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "core_customer_logins" ADD COLUMN "website_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "core_customer_sessions" ADD COLUMN "account_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "core_customer_notifications" ADD COLUMN "website_id" text;--> statement-breakpoint
ALTER TABLE "core_customer_accounts" ADD CONSTRAINT "core_customer_accounts_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_accounts" ADD CONSTRAINT "core_customer_accounts_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "public"."core_websites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_accounts" ADD CONSTRAINT "core_customer_accounts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."core_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_websites" ADD CONSTRAINT "core_websites_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_customer_accounts_org_website_customer_key" ON "core_customer_accounts" USING btree ("org_id","website_id","customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "core_customer_accounts_id_website_key" ON "core_customer_accounts" USING btree ("id","website_id");--> statement-breakpoint
CREATE INDEX "core_customer_accounts_org_customer_idx" ON "core_customer_accounts" USING btree ("org_id","customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "core_websites_org_plugin_record_key" ON "core_websites" USING btree ("org_id","plugin","record_id");--> statement-breakpoint
CREATE INDEX "core_websites_origins_idx" ON "core_websites" USING gin ("origins");--> statement-breakpoint
ALTER TABLE "core_customer_codes" ADD CONSTRAINT "core_customer_codes_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "public"."core_websites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_codes" ADD CONSTRAINT "core_customer_codes_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."core_customer_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_logins" ADD CONSTRAINT "core_customer_logins_account_fkey" FOREIGN KEY ("account_id","website_id") REFERENCES "public"."core_customer_accounts"("id","website_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "core_customer_sessions" ADD CONSTRAINT "core_customer_sessions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."core_customer_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_notifications" ADD CONSTRAINT "core_customer_notifications_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "public"."core_websites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_customer_codes_org_website_address_idx" ON "core_customer_codes" USING btree ("org_id","website_id","kind","value","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "core_customer_logins_org_website_kind_value_key" ON "core_customer_logins" USING btree ("org_id","website_id","kind","value");--> statement-breakpoint
CREATE INDEX "core_customer_logins_org_account_idx" ON "core_customer_logins" USING btree ("org_id","account_id");--> statement-breakpoint
CREATE INDEX "core_customer_sessions_org_account_idx" ON "core_customer_sessions" USING btree ("org_id","account_id");--> statement-breakpoint
ALTER TABLE "core_customer_codes" DROP COLUMN "customer_id";--> statement-breakpoint
ALTER TABLE "core_customer_logins" DROP COLUMN "customer_id";--> statement-breakpoint
ALTER TABLE "core_customer_sessions" DROP COLUMN "customer_id";--> statement-breakpoint
ALTER TABLE "core_customer_sessions" DROP COLUMN "client_id";--> statement-breakpoint
ALTER TABLE core_websites ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_websites FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_websites USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_customer_accounts ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_customer_accounts FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_customer_accounts USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
