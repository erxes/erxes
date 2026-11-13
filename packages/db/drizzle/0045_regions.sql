ALTER TABLE "core_payment_invoices" ALTER COLUMN "currency" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "core_products" ALTER COLUMN "currency" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "core_organizations" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "core_organizations" ADD COLUMN "currency" text DEFAULT 'MNT' NOT NULL;--> statement-breakpoint
-- Organisations made before this used tögrög, the only currency there was; new ones default to USD.
ALTER TABLE "core_organizations" ALTER COLUMN "currency" SET DEFAULT 'USD';