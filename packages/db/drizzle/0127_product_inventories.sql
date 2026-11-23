CREATE TABLE "core_product_inventories" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"product_id" text NOT NULL,
	"branch_id" text,
	"department_id" text,
	"remainder" double precision,
	"cost" double precision,
	"soon_in" double precision,
	"soon_out" double precision,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_product_inventories_org_place_key" UNIQUE NULLS NOT DISTINCT("org_id","product_id","branch_id","department_id")
);
--> statement-breakpoint
ALTER TABLE "core_product_inventories" ADD CONSTRAINT "core_product_inventories_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_product_inventories" ADD CONSTRAINT "core_product_inventories_product_fkey" FOREIGN KEY ("org_id","product_id") REFERENCES "public"."core_products"("org_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_product_inventories_org_branch_idx" ON "core_product_inventories" USING btree ("org_id","branch_id","department_id");--> statement-breakpoint
ALTER TABLE core_product_inventories ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_product_inventories FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_product_inventories USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
