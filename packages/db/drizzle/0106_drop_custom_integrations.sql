ALTER TABLE "core_integrations" DROP CONSTRAINT "core_integrations_values_secret_id_fkey";--> statement-breakpoint
DELETE FROM "core_secrets" WHERE "id" IN (SELECT "values_secret_id" FROM "core_integrations" WHERE "values_secret_id" IS NOT NULL);--> statement-breakpoint
DROP TABLE "core_integration_program_versions" CASCADE;--> statement-breakpoint
DROP TABLE "core_integration_programs" CASCADE;--> statement-breakpoint
DROP TABLE "core_integrations" CASCADE;
