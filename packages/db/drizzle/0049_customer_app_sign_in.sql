ALTER TABLE "core_customer_oauth_codes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "core_customer_oauth_codes" CASCADE;--> statement-breakpoint
SELECT set_config('app.system', 'on', true);--> statement-breakpoint
-- Sessions of core's sign-in page (no app) end: apps hold every session now.
DELETE FROM "core_customer_sessions" WHERE "client_id" IS NULL;--> statement-breakpoint
SELECT set_config('app.system', '', true);--> statement-breakpoint
ALTER TABLE "core_customer_sessions" ALTER COLUMN "client_id" SET NOT NULL;