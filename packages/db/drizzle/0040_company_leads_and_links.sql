ALTER TABLE "core_lead_events" ALTER COLUMN "customer_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "core_companies" ADD COLUMN "state" text DEFAULT 'customer' NOT NULL;--> statement-breakpoint
ALTER TABLE "core_companies" ADD COLUMN "lead_stage_id" text;--> statement-breakpoint
ALTER TABLE "core_companies" ADD COLUMN "lead_stage_changed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core_companies" ADD COLUMN "disqualify_reason" text;--> statement-breakpoint
ALTER TABLE "core_companies" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "core_companies" ADD COLUMN "source_details" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "core_companies" ADD COLUMN "converted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core_companies" ADD COLUMN "converted_by" text;--> statement-breakpoint
ALTER TABLE "core_customer_companies" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "core_customer_companies" ADD COLUMN "is_primary_contact" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "core_customer_companies" ADD COLUMN "ended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core_customer_companies" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "core_lead_events" ADD COLUMN "company_id" text;--> statement-breakpoint
ALTER TABLE "core_companies" ADD CONSTRAINT "core_companies_lead_stage_id_fkey" FOREIGN KEY ("lead_stage_id") REFERENCES "public"."core_lead_stages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_lead_events" ADD CONSTRAINT "core_lead_events_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."core_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_companies_org_state_idx" ON "core_companies" USING btree ("org_id","state");--> statement-breakpoint
CREATE INDEX "core_companies_org_lead_stage_idx" ON "core_companies" USING btree ("org_id","lead_stage_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_companies_org_source_idx" ON "core_companies" USING btree ("org_id","source");--> statement-breakpoint
CREATE INDEX "core_companies_org_converted_idx" ON "core_companies" USING btree ("org_id","converted_at") WHERE "core_companies"."converted_at" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "core_customer_companies_primary_contact_key" ON "core_customer_companies" USING btree ("company_id") WHERE "core_customer_companies"."is_primary_contact";--> statement-breakpoint
CREATE INDEX "core_lead_events_company_idx" ON "core_lead_events" USING btree ("company_id","created_at");--> statement-breakpoint
ALTER TABLE "core_companies" ADD CONSTRAINT "core_companies_state_check" CHECK ("core_companies"."state" IN ('lead', 'customer'));--> statement-breakpoint
ALTER TABLE "core_lead_events" ADD CONSTRAINT "core_lead_events_record_check" CHECK (num_nonnulls("core_lead_events"."customer_id", "core_lead_events"."company_id") = 1);