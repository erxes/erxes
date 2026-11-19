CREATE TABLE "core_email_senders" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"confirmed_at" timestamp with time zone,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD COLUMN "from_email" text;--> statement-breakpoint
ALTER TABLE "core_email_senders" ADD CONSTRAINT "core_email_senders_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_email_senders" ADD CONSTRAINT "core_email_senders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."core_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_email_senders_org_email_key" ON "core_email_senders" USING btree ("org_id","email");--> statement-breakpoint
ALTER TABLE core_email_senders ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_email_senders FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_email_senders USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
