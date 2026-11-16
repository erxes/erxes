DROP INDEX "core_fields_org_type_label_key";--> statement-breakpoint
DROP INDEX "core_fields_org_type_code_key";--> statement-breakpoint
ALTER TABLE "core_fields" ADD COLUMN "plugin" text;--> statement-breakpoint
ALTER TABLE "core_fields" ADD CONSTRAINT "core_fields_plugin_fkey" FOREIGN KEY ("plugin") REFERENCES "public"."core_plugins"("name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_fields_org_type_plugin_code_key" ON "core_fields" USING btree ("org_id","content_type","plugin","code") WHERE "core_fields"."plugin" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_fields_plugin_idx" ON "core_fields" USING btree ("plugin") WHERE "core_fields"."plugin" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "core_fields_org_type_label_key" ON "core_fields" USING btree ("org_id","content_type",lower("label")) WHERE "core_fields"."plugin" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "core_fields_org_type_code_key" ON "core_fields" USING btree ("org_id","content_type",lower("code")) WHERE "core_fields"."code" IS NOT NULL AND "core_fields"."plugin" IS NULL;--> statement-breakpoint
ALTER TABLE "core_fields" ADD CONSTRAINT "core_fields_plugin_code_check" CHECK ("core_fields"."plugin" IS NULL OR "core_fields"."code" IS NOT NULL);