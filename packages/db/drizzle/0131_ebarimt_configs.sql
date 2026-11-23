-- eBarimt keeps several configs per organisation. The one it has becomes the default; its receipts are that config's (an organisation that removed eBarimt keeps its receipts with none).
SELECT set_config('app.system', 'on', true);
--> statement-breakpoint
ALTER TABLE "core_payment_invoices" ADD COLUMN "ebarimt_id" text;--> statement-breakpoint
ALTER TABLE "core_ebarimt_settings" DROP CONSTRAINT "core_ebarimt_settings_pkey";--> statement-breakpoint
ALTER TABLE "core_ebarimt_settings" ADD COLUMN "id" text;--> statement-breakpoint
ALTER TABLE "core_ebarimt_settings" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "core_ebarimt_settings" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "core_ebarimt_settings" SET "id" = substr(md5(random()::text || "org_id"), 1, 17), "name" = "company_name", "is_default" = true;--> statement-breakpoint
ALTER TABLE "core_ebarimt_settings" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "core_ebarimt_settings" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "core_ebarimt_settings" ADD PRIMARY KEY ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "core_ebarimt_settings_org_id_id_key" ON "core_ebarimt_settings" USING btree ("org_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "core_ebarimt_settings_default_key" ON "core_ebarimt_settings" USING btree ("org_id") WHERE "core_ebarimt_settings"."is_default";--> statement-breakpoint
ALTER TABLE "core_ebarimt_receipts" ADD COLUMN "settings_id" text;--> statement-breakpoint
UPDATE "core_ebarimt_receipts" r SET "settings_id" = s."id" FROM "core_ebarimt_settings" s WHERE s."org_id" = r."org_id";--> statement-breakpoint
SELECT set_config('app.system', '', true);
