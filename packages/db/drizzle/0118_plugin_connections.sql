ALTER TABLE "core_plugin_integration_states" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "core_plugin_integration_states" CASCADE;--> statement-breakpoint
ALTER TABLE "core_integration_connections" ADD COLUMN "plugin" text;--> statement-breakpoint
ALTER TABLE "core_integration_connections" ADD COLUMN "problem" text;--> statement-breakpoint
ALTER TABLE "core_integration_connections" ADD CONSTRAINT "core_integration_connections_installation_fkey" FOREIGN KEY ("org_id","plugin") REFERENCES "public"."core_plugin_installations"("org_id","plugin") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_integration_connections" ADD CONSTRAINT "core_integration_connections_status_check" CHECK (CASE WHEN "core_integration_connections"."plugin" IS NULL THEN "core_integration_connections"."status" IN ('active', 'disabled') ELSE "core_integration_connections"."status" IN ('active', 'attention') END);--> statement-breakpoint
ALTER TABLE "core_integration_connections" ADD CONSTRAINT "core_integration_connections_problem_check" CHECK (("core_integration_connections"."status" = 'attention') = ("core_integration_connections"."problem" IS NOT NULL));--> statement-breakpoint
DELETE FROM "core_secrets" WHERE "owner" <> 'core';