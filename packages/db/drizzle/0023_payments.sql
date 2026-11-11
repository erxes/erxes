CREATE TABLE "core_payment_gateways" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"config_sealed" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_payment_gateways_kind_check" CHECK ("core_payment_gateways"."kind" IN ('qpay', 'test'))
);
--> statement-breakpoint
CREATE TABLE "core_payment_invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"gateway_id" text NOT NULL,
	"source" text NOT NULL,
	"reference_type" text NOT NULL,
	"reference_id" text NOT NULL,
	"amount" bigint NOT NULL,
	"currency" text DEFAULT 'MNT' NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"gateway_invoice_id" text,
	"payment" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"paid_at" timestamp with time zone,
	"dedupe_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_payment_invoices_status_check" CHECK ("core_payment_invoices"."status" IN ('pending', 'paid', 'cancelled', 'expired', 'failed')),
	CONSTRAINT "core_payment_invoices_amount_check" CHECK ("core_payment_invoices"."amount" > 0)
);
--> statement-breakpointCREATE UNIQUE INDEX "core_payment_gateways_org_id_id_key" ON "core_payment_gateways" USING btree ("org_id","id");
--> statement-breakpoint
ALTER TABLE "core_payment_gateways" ADD CONSTRAINT "core_payment_gateways_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_payment_invoices" ADD CONSTRAINT "core_payment_invoices_gateway_fkey" FOREIGN KEY ("org_id","gateway_id") REFERENCES "public"."core_payment_gateways"("org_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_payment_invoices_reference_idx" ON "core_payment_invoices" USING btree ("org_id","source","reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "core_payment_invoices_pending_idx" ON "core_payment_invoices" USING btree ("expires_at") WHERE "core_payment_invoices"."status" = 'pending';--> statement-breakpoint
CREATE UNIQUE INDEX "core_payment_invoices_dedupe_key" ON "core_payment_invoices" USING btree ("org_id","source","dedupe_key") WHERE "core_payment_invoices"."dedupe_key" IS NOT NULL;--> statement-breakpoint
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['core_payment_gateways', 'core_payment_invoices'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY core_tenant ON %I USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id))', t);
  END LOOP;
END $$;
