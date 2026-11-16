CREATE TABLE "core_ebarimt_receipts" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"invoice_id" text NOT NULL,
	"kind" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"previous_id" text,
	"buyer_type" text NOT NULL,
	"customer_tin" text,
	"customer_name" text,
	"consumer_no" text,
	"total_amount" bigint DEFAULT 0 NOT NULL,
	"total_vat" bigint DEFAULT 0 NOT NULL,
	"total_city_tax" bigint DEFAULT 0 NOT NULL,
	"bill_id" text,
	"bill_date" text,
	"lottery" text,
	"qr_data" text,
	"error" text,
	"request" jsonb,
	"response" jsonb,
	"inactive_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_ebarimt_receipts_kind_check" CHECK ("core_ebarimt_receipts"."kind" IN ('put', 'return')),
	CONSTRAINT "core_ebarimt_receipts_status_check" CHECK ("core_ebarimt_receipts"."status" IN ('pending', 'success', 'failed')),
	CONSTRAINT "core_ebarimt_receipts_buyer_type_check" CHECK ("core_ebarimt_receipts"."buyer_type" IN ('B2C_RECEIPT', 'B2B_RECEIPT'))
);
--> statement-breakpoint
CREATE TABLE "core_ebarimt_settings" (
	"org_id" text PRIMARY KEY DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"pos_api_url" text NOT NULL,
	"company_name" text NOT NULL,
	"merchant_tin" text NOT NULL,
	"pos_no" text DEFAULT '' NOT NULL,
	"district_code" text NOT NULL,
	"branch_no" text DEFAULT '' NOT NULL,
	"vat_percent" double precision DEFAULT 10 NOT NULL,
	"city_tax_percent" double precision DEFAULT 0 NOT NULL,
	"classification_code" text DEFAULT '' NOT NULL,
	"plugins" text[] DEFAULT '{}'::text[] NOT NULL,
	"rules" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_ebarimt_settings_status_check" CHECK ("core_ebarimt_settings"."status" IN ('active', 'disabled')),
	CONSTRAINT "core_ebarimt_settings_percent_check" CHECK ("core_ebarimt_settings"."vat_percent" >= 0 AND "core_ebarimt_settings"."vat_percent" <= 100 AND "core_ebarimt_settings"."city_tax_percent" >= 0 AND "core_ebarimt_settings"."city_tax_percent" <= 100)
);
--> statement-breakpoint
ALTER TABLE "core_payment_invoices" ADD COLUMN "tax_buyer" jsonb;--> statement-breakpoint
CREATE UNIQUE INDEX "core_ebarimt_receipts_org_id_id_key" ON "core_ebarimt_receipts" USING btree ("org_id","id");--> statement-breakpoint
ALTER TABLE "core_ebarimt_receipts" ADD CONSTRAINT "core_ebarimt_receipts_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_ebarimt_receipts" ADD CONSTRAINT "core_ebarimt_receipts_invoice_fkey" FOREIGN KEY ("org_id","invoice_id") REFERENCES "public"."core_payment_invoices"("org_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_ebarimt_receipts" ADD CONSTRAINT "core_ebarimt_receipts_previous_fkey" FOREIGN KEY ("org_id","previous_id") REFERENCES "public"."core_ebarimt_receipts"("org_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_ebarimt_settings" ADD CONSTRAINT "core_ebarimt_settings_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_ebarimt_receipts_invoice_idx" ON "core_ebarimt_receipts" USING btree ("org_id","invoice_id","created_at");--> statement-breakpoint
CREATE INDEX "core_ebarimt_receipts_created_idx" ON "core_ebarimt_receipts" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "core_ebarimt_receipts_pending_key" ON "core_ebarimt_receipts" USING btree ("org_id","invoice_id") WHERE "core_ebarimt_receipts"."status" = 'pending';--> statement-breakpoint
ALTER TABLE core_ebarimt_settings ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_ebarimt_settings FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_ebarimt_settings USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));--> statement-breakpoint
ALTER TABLE core_ebarimt_receipts ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_ebarimt_receipts FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_ebarimt_receipts USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
