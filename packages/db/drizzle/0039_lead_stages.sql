CREATE TABLE "core_lead_stages" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"name" text NOT NULL,
	"kind" text DEFAULT 'open' NOT NULL,
	"color" text DEFAULT '#64748b' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_lead_stages_kind_check" CHECK ("core_lead_stages"."kind" IN ('open', 'qualified', 'disqualified'))
);
--> statement-breakpoint
CREATE TABLE "core_lead_events" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"event" text NOT NULL,
	"from_stage_id" text,
	"to_stage_id" text,
	"reason" text,
	"actor_type" text NOT NULL,
	"actor_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_lead_events_event_check" CHECK ("core_lead_events"."event" IN ('created', 'stage', 'converted', 'reopened'))
);
--> statement-breakpoint
ALTER TABLE "core_customers" ADD COLUMN "lead_stage_id" text;--> statement-breakpoint
ALTER TABLE "core_customers" ADD COLUMN "lead_stage_changed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core_customers" ADD COLUMN "disqualify_reason" text;--> statement-breakpoint
ALTER TABLE "core_customers" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "core_customers" ADD COLUMN "source_details" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "core_customers" ADD COLUMN "converted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core_customers" ADD COLUMN "converted_by" text;--> statement-breakpoint
ALTER TABLE "core_lead_stages" ADD CONSTRAINT "core_lead_stages_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_lead_events" ADD CONSTRAINT "core_lead_events_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."core_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_lead_events" ADD CONSTRAINT "core_lead_events_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_lead_stages_org_name_key" ON "core_lead_stages" USING btree ("org_id",lower("name"));--> statement-breakpoint
CREATE INDEX "core_lead_stages_org_order_idx" ON "core_lead_stages" USING btree ("org_id","order");--> statement-breakpoint
CREATE INDEX "core_lead_events_org_created_idx" ON "core_lead_events" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE INDEX "core_lead_events_customer_idx" ON "core_lead_events" USING btree ("customer_id","created_at");--> statement-breakpoint
ALTER TABLE "core_customers" ADD CONSTRAINT "core_customers_lead_stage_id_fkey" FOREIGN KEY ("lead_stage_id") REFERENCES "public"."core_lead_stages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_customers_org_lead_stage_idx" ON "core_customers" USING btree ("org_id","lead_stage_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_customers_org_source_idx" ON "core_customers" USING btree ("org_id","source");--> statement-breakpoint
CREATE INDEX "core_customers_org_converted_idx" ON "core_customers" USING btree ("org_id","converted_at") WHERE "core_customers"."converted_at" IS NOT NULL;
--> statement-breakpoint
ALTER TABLE core_lead_stages ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_lead_stages FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_lead_stages USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_lead_events ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_lead_events FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_lead_events USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
SELECT set_config('app.system', 'on', true);
--> statement-breakpoint
-- Every organisation starts with the default stages.
INSERT INTO core_lead_stages (id, org_id, name, kind, color, "order")
SELECT substr(md5(random()::text || o.id || s.name), 1, 17), o.id, s.name, s.kind, s.color, s.ord
FROM core_organizations o
CROSS JOIN (VALUES ('New', 'open', '#3b82f6', 0), ('Contacted', 'open', '#8b5cf6', 1), ('Engaged', 'open', '#f59e0b', 2), ('Qualified', 'qualified', '#10b981', 3), ('Disqualified', 'disqualified', '#94a3b8', 4)) AS s (name, kind, color, ord);
--> statement-breakpoint
-- Leads so far start at New.
UPDATE core_customers c SET lead_stage_id = s.id, lead_stage_changed_at = c.created_at
FROM core_lead_stages s WHERE s.org_id = c.org_id AND s.name = 'New' AND c.state = 'lead';
--> statement-breakpoint
INSERT INTO core_lead_events (id, org_id, customer_id, event, to_stage_id, actor_type, created_at)
SELECT substr(md5(random()::text || c.id), 1, 17), c.org_id, c.id, 'created', c.lead_stage_id, 'system', c.created_at
FROM core_customers c WHERE c.state = 'lead';
--> statement-breakpoint
SELECT set_config('app.system', '', true);
