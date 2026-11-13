CREATE TABLE "core_product_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"name" text NOT NULL,
	"parent_id" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_products" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"kind" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"barcode" text,
	"category_id" text,
	"description" text,
	"unit" text DEFAULT 'pcs' NOT NULL,
	"price" bigint DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'MNT' NOT NULL,
	"image_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"weight_grams" integer,
	"length_mm" integer,
	"width_mm" integer,
	"height_mm" integer,
	"plugins" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "core_products_kind_check" CHECK ("core_products"."kind" IN ('goods', 'service')),
	CONSTRAINT "core_products_status_check" CHECK ("core_products"."status" IN ('active', 'archived')),
	CONSTRAINT "core_products_price_check" CHECK ("core_products"."price" >= 0),
	CONSTRAINT "core_products_size_check" CHECK (coalesce("core_products"."weight_grams", 0) >= 0 AND coalesce("core_products"."length_mm", 0) >= 0 AND coalesce("core_products"."width_mm", 0) >= 0 AND coalesce("core_products"."height_mm", 0) >= 0)
);
--> statement-breakpoint
ALTER TABLE "core_payment_invoices" ADD COLUMN "lines" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "core_product_categories_org_id_id_key" ON "core_product_categories" USING btree ("org_id","id");--> statement-breakpoint
ALTER TABLE "core_product_categories" ADD CONSTRAINT "core_product_categories_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_product_categories" ADD CONSTRAINT "core_product_categories_parent_fkey" FOREIGN KEY ("org_id","parent_id") REFERENCES "public"."core_product_categories"("org_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_products" ADD CONSTRAINT "core_products_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_products" ADD CONSTRAINT "core_products_category_fkey" FOREIGN KEY ("org_id","category_id") REFERENCES "public"."core_product_categories"("org_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_product_categories_org_parent_name_key" ON "core_product_categories" USING btree ("org_id",coalesce("parent_id", ''),lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "core_products_org_id_id_key" ON "core_products" USING btree ("org_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "core_products_org_code_key" ON "core_products" USING btree ("org_id",lower("code")) WHERE "core_products"."code" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "core_products_org_barcode_key" ON "core_products" USING btree ("org_id","barcode") WHERE "core_products"."barcode" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_products_org_created_idx" ON "core_products" USING btree ("org_id","created_at","id");--> statement-breakpoint
CREATE INDEX "core_products_org_category_idx" ON "core_products" USING btree ("org_id","category_id");--> statement-breakpoint
CREATE INDEX "core_products_plugins_idx" ON "core_products" USING gin ("plugins");--> statement-breakpoint
ALTER TABLE core_product_categories ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_product_categories FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_product_categories USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_products ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_products FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_products USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));