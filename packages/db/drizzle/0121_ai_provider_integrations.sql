ALTER TABLE "core_assistant_connections" DROP CONSTRAINT "core_assistant_connections_key_secret_id_fkey";--> statement-breakpoint
DELETE FROM "core_secrets" WHERE "id" IN (SELECT "key_secret_id" FROM "core_assistant_connections");--> statement-breakpoint
ALTER TABLE "core_assistant_connections" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "core_assistant_connections" CASCADE;--> statement-breakpoint
ALTER TABLE "core_agent_models" DROP CONSTRAINT "core_agent_models_provider_check";--> statement-breakpoint
ALTER TABLE "core_assistant_settings" ADD COLUMN "default_provider" text;--> statement-breakpoint
ALTER TABLE "core_assistant_settings" ADD COLUMN "default_model" text;--> statement-breakpoint
ALTER TABLE "core_assistant_settings" ADD CONSTRAINT "core_assistant_settings_default_provider_check" CHECK ("core_assistant_settings"."default_provider" IN ('openai', 'anthropic', 'openrouter', 'kimi', 'kimi-code', 'grok'));--> statement-breakpoint
ALTER TABLE "core_assistant_settings" ADD CONSTRAINT "core_assistant_settings_default_model_check" CHECK (("core_assistant_settings"."default_provider" is null) = ("core_assistant_settings"."default_model" is null));--> statement-breakpoint
ALTER TABLE "core_agent_models" ADD CONSTRAINT "core_agent_models_provider_check" CHECK ("core_agent_models"."provider" IN ('openai', 'anthropic', 'openrouter', 'kimi', 'kimi-code', 'grok'));