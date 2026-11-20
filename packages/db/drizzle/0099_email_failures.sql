ALTER TABLE "core_email_settings" ADD COLUMN "failed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core_email_settings" ADD COLUMN "failure" text;