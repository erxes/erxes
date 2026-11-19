ALTER TABLE "core_entitlements" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "core_entitlements" ADD COLUMN "bundles" jsonb DEFAULT '[]'::jsonb NOT NULL;