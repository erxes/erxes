ALTER TABLE "core_users" DROP COLUMN "totp_secret_sealed";--> statement-breakpoint
ALTER TABLE "core_users" DROP COLUMN "totp_pending_sealed";--> statement-breakpoint
ALTER TABLE "core_file_buckets" DROP COLUMN "secret_sealed";--> statement-breakpoint
ALTER TABLE "core_webhooks" DROP COLUMN "secret_sealed";--> statement-breakpoint
ALTER TABLE "core_payment_gateways" DROP COLUMN "config_sealed";--> statement-breakpoint
ALTER TABLE "core_audit_streams" DROP COLUMN "secret_sealed";--> statement-breakpoint
ALTER TABLE "core_audit_streams" DROP COLUMN "auth_header_value_sealed";--> statement-breakpoint
ALTER TABLE "core_customer_sessions" DROP COLUMN "token_sealed";--> statement-breakpoint
ALTER TABLE "core_assistant_connections" DROP COLUMN "sealed_key";--> statement-breakpoint
ALTER TABLE "core_email_settings" DROP COLUMN "secret_sealed";--> statement-breakpoint
ALTER TABLE "core_integrations" DROP COLUMN "secrets_sealed";