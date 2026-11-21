-- How many records a custom field's choice matches ("Tier is gold"). The text index on
-- lower(text_value) is partial (text_value IS NOT NULL), and Postgres keeps no statistics it
-- uses for a partial index's expression, so it guessed 0.5% of the rows for any value: a
-- choice a third of the customers have looked rare, and lists sorted every match instead of
-- reading the newest records and checking each. These statistics give the real share of each
-- field's values.
CREATE STATISTICS "core_customer_field_values_text_stats" (mcv) ON "field_id", lower("text_value") FROM "core_customer_field_values";--> statement-breakpoint
CREATE STATISTICS "core_company_field_values_text_stats" (mcv) ON "field_id", lower("text_value") FROM "core_company_field_values";--> statement-breakpoint
CREATE STATISTICS "core_product_field_values_text_stats" (mcv) ON "field_id", lower("text_value") FROM "core_product_field_values";--> statement-breakpoint
ANALYZE "core_customer_field_values";--> statement-breakpoint
ANALYZE "core_company_field_values";--> statement-breakpoint
ANALYZE "core_product_field_values";
