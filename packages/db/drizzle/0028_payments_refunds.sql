CREATE TABLE "core_payment_plugin_settings" (
	"org_id" text NOT NULL,
	"plugin" text NOT NULL,
	"default_gateway_id" text,
	"allowed_gateway_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_payment_plugin_settings_pkey" PRIMARY KEY("org_id","plugin")
);
--> statement-breakpoint
CREATE TABLE "core_payment_refunds" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"invoice_id" text NOT NULL,
	"amount" bigint NOT NULL,
	"reason" text NOT NULL,
	"method" text NOT NULL,
	"status" text NOT NULL,
	"gateway_refund_id" text,
	"error" text,
	"requested_by_type" text NOT NULL,
	"requested_by" text,
	"dedupe_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_payment_refunds_amount_check" CHECK ("core_payment_refunds"."amount" > 0),
	CONSTRAINT "core_payment_refunds_method_check" CHECK ("core_payment_refunds"."method" IN ('gateway', 'manual')),
	CONSTRAINT "core_payment_refunds_status_check" CHECK ("core_payment_refunds"."status" IN ('succeeded', 'failed'))
);
--> statement-breakpoint
ALTER TABLE "core_payment_invoices" DROP CONSTRAINT "core_payment_invoices_status_check";--> statement-breakpoint
ALTER TABLE "core_payment_invoices" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "core_payment_invoices" ADD COLUMN "paid_amount" bigint;--> statement-breakpoint
ALTER TABLE "core_payment_invoices" ADD COLUMN "gateway_payment_id" text;--> statement-breakpoint
ALTER TABLE "core_payment_invoices" ADD COLUMN "refunded_amount" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "core_payment_plugin_settings" ADD CONSTRAINT "core_payment_plugin_settings_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_payment_invoices_org_id_id_key" ON "core_payment_invoices" USING btree ("org_id","id");--> statement-breakpoint
ALTER TABLE "core_payment_refunds" ADD CONSTRAINT "core_payment_refunds_invoice_fkey" FOREIGN KEY ("org_id","invoice_id") REFERENCES "public"."core_payment_invoices"("org_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_payment_refunds_invoice_idx" ON "core_payment_refunds" USING btree ("org_id","invoice_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "core_payment_refunds_dedupe_key" ON "core_payment_refunds" USING btree ("org_id","invoice_id","dedupe_key") WHERE "core_payment_refunds"."dedupe_key" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "core_payment_invoices" ADD CONSTRAINT "core_payment_invoices_refunded_check" CHECK ("core_payment_invoices"."refunded_amount" >= 0 AND "core_payment_invoices"."refunded_amount" <= coalesce("core_payment_invoices"."paid_amount", "core_payment_invoices"."amount"));--> statement-breakpoint
ALTER TABLE "core_payment_invoices" ADD CONSTRAINT "core_payment_invoices_status_check" CHECK ("core_payment_invoices"."status" IN ('pending', 'paid', 'refunded', 'cancelled', 'expired', 'failed'));--> statement-breakpoint
-- Invoices paid before amounts were tracked were paid in full.
UPDATE core_payment_invoices SET paid_amount = amount WHERE status = 'paid' AND paid_amount IS NULL;
--> statement-breakpoint
ALTER TABLE core_payment_refunds ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_payment_refunds FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_payment_refunds USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_payment_plugin_settings ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_payment_plugin_settings FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_payment_plugin_settings USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
