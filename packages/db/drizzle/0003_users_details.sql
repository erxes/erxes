ALTER TABLE "core_users" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "core_users" ADD COLUMN "middle_name" text;--> statement-breakpoint
ALTER TABLE "core_users" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "core_users" ADD COLUMN "short_name" text;--> statement-breakpoint
ALTER TABLE "core_users" ADD COLUMN "employee_id" text;--> statement-breakpoint
ALTER TABLE "core_users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "core_users" ADD COLUMN "birth_date" date;--> statement-breakpoint
ALTER TABLE "core_users" ADD COLUMN "work_started_date" date;--> statement-breakpoint
ALTER TABLE "core_users" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "core_users" ADD COLUMN "links" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
-- Existing members: the first word of the full name is the first name, the rest the last name.
UPDATE "core_users" SET
  "first_name" = split_part(btrim("full_name"), ' ', 1),
  "last_name" = NULLIF(btrim(substr(btrim("full_name"), length(split_part(btrim("full_name"), ' ', 1)) + 1)), '')
WHERE btrim(coalesce("full_name", '')) <> '';
