ALTER TABLE "core_customer_sessions" ADD COLUMN "token_sealed" text;--> statement-breakpoint
ALTER TABLE "core_customer_sessions" ADD COLUMN "rotated_at" timestamp with time zone;