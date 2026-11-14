CREATE TABLE "core_assistant_references" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"thread_id" text NOT NULL,
	"record_type" text NOT NULL,
	"record_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_assistant_references_record_type_check" CHECK ("core_assistant_references"."record_type" IN ('customer', 'company', 'member', 'product', 'automation'))
);
--> statement-breakpoint
ALTER TABLE "core_assistant_references" ADD CONSTRAINT "core_assistant_references_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."core_assistant_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_assistant_references" ADD CONSTRAINT "core_assistant_references_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_assistant_references_thread_record_key" ON "core_assistant_references" USING btree ("org_id","thread_id","record_type","record_id");
--> statement-breakpoint
ALTER TABLE core_assistant_references ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_assistant_references FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_assistant_references USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));