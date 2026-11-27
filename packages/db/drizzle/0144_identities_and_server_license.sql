CREATE TABLE "core_user_identities" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"subject" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_server_license" (
	"id" text PRIMARY KEY DEFAULT 'server' NOT NULL,
	"token" text,
	"checked_at" timestamp with time zone NOT NULL,
	"check_error" text,
	CONSTRAINT "core_server_license_one_row" CHECK ("core_server_license"."id" = 'server')
);
--> statement-breakpoint
ALTER TABLE "core_user_identities" ADD CONSTRAINT "core_user_identities_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_user_identities" ADD CONSTRAINT "core_user_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."core_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_user_identities_org_provider_subject_key" ON "core_user_identities" USING btree ("org_id","provider","subject");--> statement-breakpoint
CREATE INDEX "core_user_identities_user_idx" ON "core_user_identities" USING btree ("org_id","user_id");--> statement-breakpoint
ALTER TABLE core_user_identities ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE core_user_identities FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY core_tenant ON core_user_identities USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));