ALTER TABLE "core_users" ADD COLUMN "onboarded_at" timestamp with time zone;--> statement-breakpoint
-- Members who already use erxes have seen the welcome steps.
UPDATE core_users SET onboarded_at = now() WHERE status = 'active' AND onboarded_at IS NULL;
