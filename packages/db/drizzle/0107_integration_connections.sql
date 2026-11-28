ALTER TABLE "core_payment_gateways" RENAME TO "core_integration_connections";--> statement-breakpoint
ALTER TABLE "core_integration_connections" RENAME COLUMN "kind" TO "key";--> statement-breakpoint
ALTER TABLE "core_integration_connections" RENAME COLUMN "config_secret_id" TO "secret_id";--> statement-breakpoint
ALTER TABLE "core_integration_connections" DROP CONSTRAINT "core_payment_gateways_kind_check";--> statement-breakpoint
ALTER TABLE "core_integration_connections" RENAME CONSTRAINT "core_payment_gateways_pkey" TO "core_integration_connections_pkey";--> statement-breakpoint
ALTER TABLE "core_integration_connections" RENAME CONSTRAINT "core_payment_gateways_org_id_fkey" TO "core_integration_connections_org_id_fkey";--> statement-breakpoint
ALTER TABLE "core_integration_connections" RENAME CONSTRAINT "core_payment_gateways_config_secret_id_fkey" TO "core_integration_connections_secret_id_fkey";--> statement-breakpoint
ALTER INDEX "core_payment_gateways_org_id_id_key" RENAME TO "core_integration_connections_org_id_id_key";
--> statement-breakpoint
DROP TRIGGER core_payment_gateways_drop_secrets ON core_integration_connections;
--> statement-breakpoint
CREATE TRIGGER core_integration_connections_drop_secrets AFTER DELETE OR UPDATE OF secret_id ON core_integration_connections
  FOR EACH ROW EXECUTE FUNCTION core_drop_secrets('secret_id');
