ALTER TABLE "core_files" ADD COLUMN "public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD COLUMN "content" jsonb;--> statement-breakpoint
ALTER TABLE "core_broadcasts" ADD COLUMN "html" text;--> statement-breakpoint
ALTER TABLE "core_files" ADD CONSTRAINT "core_files_public_check" CHECK (not "core_files"."public" or "core_files"."content_type" IN ('image/png', 'image/jpeg', 'image/gif', 'image/webp'));