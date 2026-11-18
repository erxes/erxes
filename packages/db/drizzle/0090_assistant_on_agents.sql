ALTER TABLE "core_assistant_messages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "core_assistant_messages" CASCADE;--> statement-breakpoint
ALTER TABLE "core_assistant_settings" DROP CONSTRAINT "core_assistant_settings_approval_mode_check";--> statement-breakpoint
ALTER TABLE "core_assistant_settings" DROP COLUMN "approval_mode";--> statement-breakpoint
ALTER TABLE "core_assistant_threads" DROP COLUMN "running_since";