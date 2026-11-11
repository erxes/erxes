ALTER TABLE "core_files" DROP CONSTRAINT "core_files_status_check";--> statement-breakpoint
CREATE INDEX "core_files_deleting_idx" ON "core_files" USING btree ("updated_at") WHERE "core_files"."status" = 'deleting';--> statement-breakpoint
ALTER TABLE "core_files" ADD CONSTRAINT "core_files_status_check" CHECK ("core_files"."status" IN ('pending', 'ready', 'deleting'));