CREATE TABLE "core_oauth_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"client_id" text NOT NULL,
	"user_id" text NOT NULL,
	"code_hash" text NOT NULL,
	"redirect_uri" text NOT NULL,
	"code_challenge" text NOT NULL,
	"scope" text NOT NULL,
	"nonce" text,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_oauth_refresh_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"client_id" text NOT NULL,
	"user_id" text NOT NULL,
	"family_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"scope" text NOT NULL,
	"session_version" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core_oauth_codes" ADD CONSTRAINT "core_oauth_codes_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_oauth_refresh_tokens" ADD CONSTRAINT "core_oauth_refresh_tokens_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_oauth_refresh_tokens_family_idx" ON "core_oauth_refresh_tokens" USING btree ("family_id");--> statement-breakpoint
CREATE INDEX "core_oauth_refresh_tokens_user_idx" ON "core_oauth_refresh_tokens" USING btree ("org_id","user_id");--> statement-breakpoint
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['core_oauth_codes', 'core_oauth_refresh_tokens'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY core_tenant ON %I USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id))', t);
  END LOOP;
END $$;
--> statement-breakpoint
ALTER TABLE core_oauth_codes ADD CONSTRAINT core_oauth_codes_user_org_fkey
  FOREIGN KEY (org_id, user_id) REFERENCES core_users (org_id, id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE core_oauth_refresh_tokens ADD CONSTRAINT core_oauth_refresh_tokens_user_org_fkey
  FOREIGN KEY (org_id, user_id) REFERENCES core_users (org_id, id) ON DELETE CASCADE;
