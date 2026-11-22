CREATE TABLE "core_bank_transfers" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"connection_id" text NOT NULL,
	"bank" text NOT NULL,
	"reference" text NOT NULL,
	"type" text NOT NULL,
	"from_account" text NOT NULL,
	"to_account" text NOT NULL,
	"to_account_name" text,
	"to_bank" text,
	"amount" bigint NOT NULL,
	"currency" text NOT NULL,
	"description" text NOT NULL,
	"status" text NOT NULL,
	"bank_reference" text,
	"error" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	CONSTRAINT "core_bank_transfers_bank_check" CHECK ("core_bank_transfers"."bank" IN ('khanbank', 'golomt', 'tdb')),
	CONSTRAINT "core_bank_transfers_type_check" CHECK ("core_bank_transfers"."type" IN ('domestic', 'interbank')),
	CONSTRAINT "core_bank_transfers_status_check" CHECK ("core_bank_transfers"."status" IN ('sending', 'sent', 'failed')),
	CONSTRAINT "core_bank_transfers_amount_check" CHECK ("core_bank_transfers"."amount" > 0)
);
--> statement-breakpoint
ALTER TABLE "core_bank_transfers" ADD CONSTRAINT "core_bank_transfers_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_bank_transfers_org_id_reference_key" ON "core_bank_transfers" USING btree ("org_id","reference");--> statement-breakpoint
CREATE INDEX "core_bank_transfers_org_id_created_at_idx" ON "core_bank_transfers" USING btree ("org_id","created_at");--> statement-breakpoint
ALTER TABLE core_bank_transfers ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE core_bank_transfers FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY core_tenant ON core_bank_transfers USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
