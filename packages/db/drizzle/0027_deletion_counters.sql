CREATE TABLE "core_deletion_counters" (
	"org_id" text NOT NULL,
	"actor" text NOT NULL,
	"bucket" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "core_deletion_counters_pkey" PRIMARY KEY("org_id","actor","bucket")
);
--> statement-breakpoint
ALTER TABLE "core_deletion_counters" ADD CONSTRAINT "core_deletion_counters_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE core_deletion_counters ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_deletion_counters FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_deletion_counters USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
