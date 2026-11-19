ALTER TABLE "core_fields" ADD COLUMN "is_required" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "core_fields" ADD COLUMN "is_visible_to_create" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "core_fields" ADD COLUMN "logic" jsonb;