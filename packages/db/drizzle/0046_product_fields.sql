CREATE TABLE "core_product_field_values" (
	"org_id" text NOT NULL,
	"record_id" text NOT NULL,
	"field_id" text NOT NULL,
	"position" smallint DEFAULT 0 NOT NULL,
	"text_value" text,
	"number_value" double precision,
	"date_value" date,
	"bool_value" boolean,
	CONSTRAINT "core_product_field_values_pkey" PRIMARY KEY("record_id","field_id","position"),
	CONSTRAINT "core_product_field_values_one_value_check" CHECK (num_nonnulls("core_product_field_values"."text_value", "core_product_field_values"."number_value", "core_product_field_values"."date_value", "core_product_field_values"."bool_value") = 1)
);
--> statement-breakpoint
ALTER TABLE "core_field_groups" DROP CONSTRAINT "core_field_groups_content_type_check";--> statement-breakpoint
ALTER TABLE "core_fields" DROP CONSTRAINT "core_fields_content_type_check";--> statement-breakpoint
ALTER TABLE "core_product_field_values" ADD CONSTRAINT "core_product_field_values_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "public"."core_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_product_field_values" ADD CONSTRAINT "core_product_field_values_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "public"."core_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_product_field_values" ADD CONSTRAINT "core_product_field_values_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_product_field_values_field_idx" ON "core_product_field_values" USING btree ("field_id","record_id");--> statement-breakpoint
CREATE INDEX "core_product_field_values_text_idx" ON "core_product_field_values" USING btree ("org_id","field_id",lower("text_value")) WHERE "core_product_field_values"."text_value" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_product_field_values_text_trgm_idx" ON "core_product_field_values" USING gin ("text_value" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "core_product_field_values_number_idx" ON "core_product_field_values" USING btree ("org_id","field_id","number_value") WHERE "core_product_field_values"."number_value" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_product_field_values_date_idx" ON "core_product_field_values" USING btree ("org_id","field_id","date_value") WHERE "core_product_field_values"."date_value" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_product_field_values_month_day_idx" ON "core_product_field_values" USING btree ("org_id","field_id",((extract(month from "date_value") * 100 + extract(day from "date_value"))::smallint)) WHERE "core_product_field_values"."date_value" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_product_field_values_bool_idx" ON "core_product_field_values" USING btree ("org_id","field_id","bool_value") WHERE "core_product_field_values"."bool_value" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "core_field_groups" ADD CONSTRAINT "core_field_groups_content_type_check" CHECK ("core_field_groups"."content_type" IN ('customer', 'company', 'product'));--> statement-breakpoint
ALTER TABLE "core_fields" ADD CONSTRAINT "core_fields_content_type_check" CHECK ("core_fields"."content_type" IN ('customer', 'company', 'product'));--> statement-breakpoint
ALTER TABLE core_product_field_values ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_product_field_values FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_product_field_values USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));