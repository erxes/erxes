CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
-- array_to_string is only "stable" (it could format any type); for text it never changes, so search columns may use it.
CREATE OR REPLACE FUNCTION core_join_text(p text[]) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$ SELECT coalesce(array_to_string(p, ' '), '') $$;
--> statement-breakpoint
CREATE TABLE "core_company_field_values" (
	"org_id" text NOT NULL,
	"record_id" text NOT NULL,
	"field_id" text NOT NULL,
	"position" smallint DEFAULT 0 NOT NULL,
	"text_value" text,
	"number_value" double precision,
	"date_value" date,
	"bool_value" boolean,
	CONSTRAINT "core_company_field_values_pkey" PRIMARY KEY("record_id","field_id","position"),
	CONSTRAINT "core_company_field_values_one_value_check" CHECK (num_nonnulls("core_company_field_values"."text_value", "core_company_field_values"."number_value", "core_company_field_values"."date_value", "core_company_field_values"."bool_value") = 1)
);
--> statement-breakpoint
CREATE TABLE "core_customer_field_values" (
	"org_id" text NOT NULL,
	"record_id" text NOT NULL,
	"field_id" text NOT NULL,
	"position" smallint DEFAULT 0 NOT NULL,
	"text_value" text,
	"number_value" double precision,
	"date_value" date,
	"bool_value" boolean,
	CONSTRAINT "core_customer_field_values_pkey" PRIMARY KEY("record_id","field_id","position"),
	CONSTRAINT "core_customer_field_values_one_value_check" CHECK (num_nonnulls("core_customer_field_values"."text_value", "core_customer_field_values"."number_value", "core_customer_field_values"."date_value", "core_customer_field_values"."bool_value") = 1)
);
--> statement-breakpoint
ALTER TABLE "core_companies" ADD COLUMN "last_activity_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "core_companies" ADD COLUMN "search_text" text GENERATED ALWAYS AS (lower(core_join_text(names) || ' ' || primary_name || ' ' || core_join_text(emails) || ' ' || core_join_text(phones) || ' ' || coalesce(code, ''))) STORED;--> statement-breakpoint
ALTER TABLE "core_customers" ADD COLUMN "last_activity_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "core_customers" ADD COLUMN "birth_month_day" smallint GENERATED ALWAYS AS (((extract(month from birth_date) * 100 + extract(day from birth_date))::smallint)) STORED;--> statement-breakpoint
ALTER TABLE "core_customers" ADD COLUMN "search_text" text GENERATED ALWAYS AS (lower(coalesce(first_name, '') || ' ' || coalesce(middle_name, '') || ' ' || coalesce(last_name, '') || ' ' || core_join_text(emails) || ' ' || core_join_text(phones) || ' ' || coalesce(code, ''))) STORED;--> statement-breakpoint
ALTER TABLE "core_company_field_values" ADD CONSTRAINT "core_company_field_values_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "public"."core_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_company_field_values" ADD CONSTRAINT "core_company_field_values_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "public"."core_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_company_field_values" ADD CONSTRAINT "core_company_field_values_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_field_values" ADD CONSTRAINT "core_customer_field_values_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "public"."core_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_field_values" ADD CONSTRAINT "core_customer_field_values_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "public"."core_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_field_values" ADD CONSTRAINT "core_customer_field_values_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_company_field_values_field_idx" ON "core_company_field_values" USING btree ("field_id","record_id");--> statement-breakpoint
CREATE INDEX "core_company_field_values_text_idx" ON "core_company_field_values" USING btree ("org_id","field_id",lower("text_value")) WHERE "core_company_field_values"."text_value" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_company_field_values_text_trgm_idx" ON "core_company_field_values" USING gin ("text_value" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "core_company_field_values_number_idx" ON "core_company_field_values" USING btree ("org_id","field_id","number_value") WHERE "core_company_field_values"."number_value" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_company_field_values_date_idx" ON "core_company_field_values" USING btree ("org_id","field_id","date_value") WHERE "core_company_field_values"."date_value" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_company_field_values_month_day_idx" ON "core_company_field_values" USING btree ("org_id","field_id",((extract(month from "date_value") * 100 + extract(day from "date_value"))::smallint)) WHERE "core_company_field_values"."date_value" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_company_field_values_bool_idx" ON "core_company_field_values" USING btree ("org_id","field_id","bool_value") WHERE "core_company_field_values"."bool_value" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_customer_field_values_field_idx" ON "core_customer_field_values" USING btree ("field_id","record_id");--> statement-breakpoint
CREATE INDEX "core_customer_field_values_text_idx" ON "core_customer_field_values" USING btree ("org_id","field_id",lower("text_value")) WHERE "core_customer_field_values"."text_value" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_customer_field_values_text_trgm_idx" ON "core_customer_field_values" USING gin ("text_value" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "core_customer_field_values_number_idx" ON "core_customer_field_values" USING btree ("org_id","field_id","number_value") WHERE "core_customer_field_values"."number_value" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_customer_field_values_date_idx" ON "core_customer_field_values" USING btree ("org_id","field_id","date_value") WHERE "core_customer_field_values"."date_value" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_customer_field_values_month_day_idx" ON "core_customer_field_values" USING btree ("org_id","field_id",((extract(month from "date_value") * 100 + extract(day from "date_value"))::smallint)) WHERE "core_customer_field_values"."date_value" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_customer_field_values_bool_idx" ON "core_customer_field_values" USING btree ("org_id","field_id","bool_value") WHERE "core_customer_field_values"."bool_value" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_companies_org_last_activity_idx" ON "core_companies" USING btree ("org_id","last_activity_at");--> statement-breakpoint
CREATE INDEX "core_companies_org_owner_idx" ON "core_companies" USING btree ("org_id","owner_id");--> statement-breakpoint
CREATE INDEX "core_companies_org_industry_idx" ON "core_companies" USING btree ("org_id",lower("industry"));--> statement-breakpoint
CREATE INDEX "core_companies_search_trgm_idx" ON "core_companies" USING gin ("search_text" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "core_companies_primary_name_trgm_idx" ON "core_companies" USING gin ("primary_name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "core_customers_org_last_activity_idx" ON "core_customers" USING btree ("org_id","last_activity_at");--> statement-breakpoint
CREATE INDEX "core_customers_org_birth_month_day_idx" ON "core_customers" USING btree ("org_id","birth_month_day") WHERE "core_customers"."birth_month_day" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_customers_org_owner_idx" ON "core_customers" USING btree ("org_id","owner_id");--> statement-breakpoint
CREATE INDEX "core_customers_search_trgm_idx" ON "core_customers" USING gin ("search_text" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "core_customers_first_name_trgm_idx" ON "core_customers" USING gin ("first_name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "core_customers_last_name_trgm_idx" ON "core_customers" USING gin ("last_name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "core_customers_primary_email_trgm_idx" ON "core_customers" USING gin ("primary_email" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "core_customers_primary_phone_trgm_idx" ON "core_customers" USING gin ("primary_phone" gin_trgm_ops);
--> statement-breakpoint
ALTER TABLE core_customer_field_values ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_customer_field_values FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_customer_field_values USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_company_field_values ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_company_field_values FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_company_field_values USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
-- Last activity is kept by the timeline itself: every entry moves its record's forward.
CREATE OR REPLACE FUNCTION core_activity_touch() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.target_type = 'customer' THEN
    UPDATE core_customers SET last_activity_at = NEW.created_at
    WHERE id = NEW.target_id AND org_id = NEW.org_id AND last_activity_at < NEW.created_at;
  ELSIF NEW.target_type = 'company' THEN
    UPDATE core_companies SET last_activity_at = NEW.created_at
    WHERE id = NEW.target_id AND org_id = NEW.org_id AND last_activity_at < NEW.created_at;
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE TRIGGER core_activities_touch AFTER INSERT ON core_activities FOR EACH ROW EXECUTE FUNCTION core_activity_touch();
--> statement-breakpoint
SELECT set_config('app.system', 'on', true);
--> statement-breakpoint
UPDATE core_customers c SET last_activity_at = greatest(c.created_at, (SELECT max(a.created_at) FROM core_activities a WHERE a.org_id = c.org_id AND a.target_type = 'customer' AND a.target_id = c.id));
--> statement-breakpoint
UPDATE core_companies c SET last_activity_at = greatest(c.created_at, (SELECT max(a.created_at) FROM core_activities a WHERE a.org_id = c.org_id AND a.target_type = 'company' AND a.target_id = c.id));
--> statement-breakpoint
INSERT INTO core_customer_field_values (org_id, record_id, field_id, position, text_value, number_value, date_value, bool_value)
SELECT * FROM (
  SELECT r.org_id, r.id, f.id, (e.ord - 1)::smallint,
    CASE WHEN f.type NOT IN ('number', 'date', 'boolean') AND jsonb_typeof(e.v) IN ('string', 'number') AND (e.v #>> '{}') <> '' THEN e.v #>> '{}' END,
    CASE WHEN f.type = 'number' AND jsonb_typeof(e.v) = 'number' THEN (e.v #>> '{}')::double precision END,
    CASE WHEN f.type = 'date' AND (e.v #>> '{}') ~ '^\d{4}-\d{2}-\d{2}$' THEN (e.v #>> '{}')::date END,
    CASE WHEN f.type = 'boolean' AND jsonb_typeof(e.v) = 'boolean' THEN (e.v #>> '{}')::boolean END
  FROM core_customers r
  CROSS JOIN LATERAL jsonb_each(r.custom_fields) kv
  JOIN core_fields f ON f.id = kv.key AND f.org_id = r.org_id AND f.content_type = 'customer'
  CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(kv.value) = 'array' THEN kv.value ELSE jsonb_build_array(kv.value) END) WITH ORDINALITY e(v, ord)
) v (org_id, record_id, field_id, position, text_value, number_value, date_value, bool_value)
WHERE num_nonnulls(text_value, number_value, date_value, bool_value) = 1
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO core_company_field_values (org_id, record_id, field_id, position, text_value, number_value, date_value, bool_value)
SELECT * FROM (
  SELECT r.org_id, r.id, f.id, (e.ord - 1)::smallint,
    CASE WHEN f.type NOT IN ('number', 'date', 'boolean') AND jsonb_typeof(e.v) IN ('string', 'number') AND (e.v #>> '{}') <> '' THEN e.v #>> '{}' END,
    CASE WHEN f.type = 'number' AND jsonb_typeof(e.v) = 'number' THEN (e.v #>> '{}')::double precision END,
    CASE WHEN f.type = 'date' AND (e.v #>> '{}') ~ '^\d{4}-\d{2}-\d{2}$' THEN (e.v #>> '{}')::date END,
    CASE WHEN f.type = 'boolean' AND jsonb_typeof(e.v) = 'boolean' THEN (e.v #>> '{}')::boolean END
  FROM core_companies r
  CROSS JOIN LATERAL jsonb_each(r.custom_fields) kv
  JOIN core_fields f ON f.id = kv.key AND f.org_id = r.org_id AND f.content_type = 'company'
  CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(kv.value) = 'array' THEN kv.value ELSE jsonb_build_array(kv.value) END) WITH ORDINALITY e(v, ord)
) v (org_id, record_id, field_id, position, text_value, number_value, date_value, bool_value)
WHERE num_nonnulls(text_value, number_value, date_value, bool_value) = 1
ON CONFLICT DO NOTHING;
--> statement-breakpoint
SELECT set_config('app.system', '', true);
