CREATE TABLE "core_api_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"secret_hash" text NOT NULL,
	"expires_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core_api_keys" ADD CONSTRAINT "core_api_keys_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_api_keys" ADD CONSTRAINT "core_api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."core_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_api_keys_org_user_idx" ON "core_api_keys" USING btree ("org_id","user_id");--> statement-breakpoint
ALTER TABLE core_api_keys ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_api_keys FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_api_keys USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
