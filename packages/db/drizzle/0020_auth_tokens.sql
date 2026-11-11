CREATE TABLE "core_auth_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"purpose" text NOT NULL,
	"secret_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_auth_tokens_purpose_check" CHECK ("core_auth_tokens"."purpose" IN ('invite', 'password_reset'))
);
--> statement-breakpoint
ALTER TABLE "core_auth_tokens" ADD CONSTRAINT "core_auth_tokens_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_auth_tokens_user_idx" ON "core_auth_tokens" USING btree ("org_id","user_id","purpose");--> statement-breakpoint
ALTER TABLE core_auth_tokens ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_auth_tokens FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_auth_tokens USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_auth_tokens ADD CONSTRAINT core_auth_tokens_user_org_fkey
  FOREIGN KEY (org_id, user_id) REFERENCES core_users (org_id, id) ON DELETE CASCADE;
