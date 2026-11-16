CREATE TABLE "core_product_tags" (
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"product_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_product_tags_pkey" PRIMARY KEY("product_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "core_tags" DROP CONSTRAINT "core_tags_type_check";--> statement-breakpoint
ALTER TABLE "core_products" ADD COLUMN "parent_id" text;--> statement-breakpoint
ALTER TABLE "core_products" ADD COLUMN "variant_options" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "core_product_tags" ADD CONSTRAINT "core_product_tags_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."core_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_product_tags" ADD CONSTRAINT "core_product_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."core_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_product_tags" ADD CONSTRAINT "core_product_tags_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_product_tags_tag_idx" ON "core_product_tags" USING btree ("tag_id","product_id");--> statement-breakpoint
ALTER TABLE "core_products" ADD CONSTRAINT "core_products_parent_fkey" FOREIGN KEY ("org_id","parent_id") REFERENCES "public"."core_products"("org_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_products_org_parent_idx" ON "core_products" USING btree ("org_id","parent_id") WHERE "core_products"."parent_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "core_tags" ADD CONSTRAINT "core_tags_type_check" CHECK ("core_tags"."type" IN ('customer', 'company', 'product'));--> statement-breakpoint
ALTER TABLE "core_products" ADD CONSTRAINT "core_products_parent_check" CHECK ("core_products"."parent_id" <> "core_products"."id");--> statement-breakpoint
ALTER TABLE core_product_tags ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_product_tags FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_product_tags USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
