DROP TABLE "core_payment_plugin_settings" CASCADE;--> statement-breakpoint
ALTER TABLE "core_organizations" ADD COLUMN "default_gateway_id" text;--> statement-breakpoint
ALTER TABLE "core_ebarimt_settings" DROP COLUMN "plugins";