ALTER TABLE "core_email_deliveries" DROP CONSTRAINT "core_email_deliveries_status_check";--> statement-breakpoint
ALTER TABLE "core_email_deliveries" ADD COLUMN "reported_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core_email_deliveries" ADD COLUMN "deferrals" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "core_email_settings" ADD COLUMN "events_key" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "core_email_settings" ADD COLUMN "configuration_set" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "core_email_settings" ADD COLUMN "events_topic_arn" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "core_email_deliveries" ADD CONSTRAINT "core_email_deliveries_status_check" CHECK ("core_email_deliveries"."status" IN ('queued', 'sent', 'delivered', 'bounced', 'complained', 'failed'));