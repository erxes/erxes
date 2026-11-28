ALTER TABLE "core_customer_codes" DROP CONSTRAINT "core_customer_codes_purpose_check";--> statement-breakpoint
ALTER TABLE "core_fields" ADD COLUMN "customer_editable" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "core_customer_codes" ADD COLUMN "sign_up" jsonb;--> statement-breakpoint
ALTER TABLE "core_customer_codes" ADD CONSTRAINT "core_customer_codes_purpose_check" CHECK ("core_customer_codes"."purpose" IN ('sign_up', 'sign_in', 'add_login'));