ALTER TABLE "core_users" ADD COLUMN "totp_secret_sealed" text;--> statement-breakpoint
ALTER TABLE "core_users" ADD COLUMN "totp_pending_sealed" text;--> statement-breakpoint
ALTER TABLE "core_users" ADD COLUMN "totp_enabled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core_users" ADD COLUMN "totp_last_step" integer;--> statement-breakpoint
ALTER TABLE "core_users" ADD COLUMN "recovery_codes" text[];