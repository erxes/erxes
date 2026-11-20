CREATE TABLE "core_email_reply_tos" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"email" text NOT NULL,
	"status" text NOT NULL,
	"secret_hash" text,
	"expires_at" timestamp with time zone,
	"verified_at" timestamp with time zone,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_email_reply_tos_status_check" CHECK ("core_email_reply_tos"."status" IN ('pending', 'verified'))
);
--> statement-breakpoint
ALTER TABLE "core_email_reply_tos" ADD CONSTRAINT "core_email_reply_tos_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_email_reply_tos_org_email_key" ON "core_email_reply_tos" USING btree ("org_id",lower("email"));--> statement-breakpoint
ALTER TABLE core_email_reply_tos ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_email_reply_tos FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_email_reply_tos USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
