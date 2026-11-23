CREATE TABLE "core_exchange_rates" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"date" date NOT NULL,
	"main_currency" text NOT NULL,
	"rate_currency" text NOT NULL,
	"rate" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_exchange_rates_rate_check" CHECK ("core_exchange_rates"."rate" > 0)
);
--> statement-breakpoint
ALTER TABLE "core_exchange_rates" ADD CONSTRAINT "core_exchange_rates_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_exchange_rates_org_pair_date_key" ON "core_exchange_rates" USING btree ("org_id","main_currency","rate_currency","date");--> statement-breakpoint
CREATE INDEX "core_exchange_rates_org_created_idx" ON "core_exchange_rates" USING btree ("org_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE core_exchange_rates ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_exchange_rates FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_exchange_rates USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
