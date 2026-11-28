DROP INDEX "core_company_field_values_month_day_idx";--> statement-breakpoint
DROP INDEX "core_customer_field_values_month_day_idx";--> statement-breakpoint
DROP INDEX "core_product_field_values_month_day_idx";--> statement-breakpoint
ALTER TABLE "core_company_field_values" ADD COLUMN "month_day" smallint GENERATED ALWAYS AS (((extract(month from date_value) * 100 + extract(day from date_value))::smallint)) STORED;--> statement-breakpoint
ALTER TABLE "core_customer_field_values" ADD COLUMN "month_day" smallint GENERATED ALWAYS AS (((extract(month from date_value) * 100 + extract(day from date_value))::smallint)) STORED;--> statement-breakpoint
ALTER TABLE "core_product_field_values" ADD COLUMN "month_day" smallint GENERATED ALWAYS AS (((extract(month from date_value) * 100 + extract(day from date_value))::smallint)) STORED;--> statement-breakpoint
CREATE INDEX "core_company_field_values_month_day_idx" ON "core_company_field_values" USING btree ("org_id","field_id","month_day") WHERE "core_company_field_values"."month_day" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_customer_field_values_month_day_idx" ON "core_customer_field_values" USING btree ("org_id","field_id","month_day") WHERE "core_customer_field_values"."month_day" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_product_field_values_month_day_idx" ON "core_product_field_values" USING btree ("org_id","field_id","month_day") WHERE "core_product_field_values"."month_day" IS NOT NULL;--> statement-breakpoint
ANALYZE "core_customer_field_values";--> statement-breakpoint
ANALYZE "core_company_field_values";--> statement-breakpoint
ANALYZE "core_product_field_values";