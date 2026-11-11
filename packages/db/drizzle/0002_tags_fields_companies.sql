CREATE TABLE "core_companies" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"primary_name" text NOT NULL,
	"names" text[] DEFAULT '{}'::text[] NOT NULL,
	"avatar_url" text,
	"primary_email" text,
	"emails" text[] DEFAULT '{}'::text[] NOT NULL,
	"primary_phone" text,
	"phones" text[] DEFAULT '{}'::text[] NOT NULL,
	"website" text,
	"industry" text,
	"size" integer,
	"business_type" text,
	"code" text,
	"description" text,
	"owner_id" text,
	"custom_fields" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"merged_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_customer_companies" (
	"org_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"company_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_customer_companies_pkey" PRIMARY KEY("customer_id","company_id")
);
--> statement-breakpoint
CREATE TABLE "core_fields" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"content_type" text NOT NULL,
	"label" text NOT NULL,
	"type" text NOT NULL,
	"options" text[] DEFAULT '{}'::text[] NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_fields_content_type_check" CHECK ("core_fields"."content_type" IN ('customer', 'company')),
	CONSTRAINT "core_fields_type_check" CHECK ("core_fields"."type" IN ('text', 'textarea', 'number', 'date', 'boolean', 'select', 'multiselect'))
);
--> statement-breakpoint
CREATE TABLE "core_company_tags" (
	"org_id" text NOT NULL,
	"company_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_company_tags_pkey" PRIMARY KEY("company_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "core_customer_tags" (
	"org_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_customer_tags_pkey" PRIMARY KEY("customer_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "core_tags" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"color_code" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_tags_type_check" CHECK ("core_tags"."type" IN ('customer', 'company'))
);
--> statement-breakpoint
ALTER TABLE "core_customers" ADD COLUMN "custom_fields" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "core_customers" ADD COLUMN "merged_ids" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "core_companies" ADD CONSTRAINT "core_companies_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_companies" ADD CONSTRAINT "core_companies_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."core_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_companies" ADD CONSTRAINT "core_customer_companies_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."core_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_companies" ADD CONSTRAINT "core_customer_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."core_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_companies" ADD CONSTRAINT "core_customer_companies_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_fields" ADD CONSTRAINT "core_fields_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_company_tags" ADD CONSTRAINT "core_company_tags_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."core_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_company_tags" ADD CONSTRAINT "core_company_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."core_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_company_tags" ADD CONSTRAINT "core_company_tags_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_tags" ADD CONSTRAINT "core_customer_tags_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."core_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_tags" ADD CONSTRAINT "core_customer_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."core_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customer_tags" ADD CONSTRAINT "core_customer_tags_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_tags" ADD CONSTRAINT "core_tags_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_companies_org_primary_name_key" ON "core_companies" USING btree ("org_id",lower("primary_name"));--> statement-breakpoint
CREATE INDEX "core_companies_org_created_idx" ON "core_companies" USING btree ("org_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_customer_companies_company_idx" ON "core_customer_companies" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "core_fields_org_type_label_key" ON "core_fields" USING btree ("org_id","content_type",lower("label"));--> statement-breakpoint
CREATE INDEX "core_fields_org_type_idx" ON "core_fields" USING btree ("org_id","content_type","order");--> statement-breakpoint
CREATE INDEX "core_company_tags_tag_idx" ON "core_company_tags" USING btree ("tag_id","company_id");--> statement-breakpoint
CREATE INDEX "core_customer_tags_tag_idx" ON "core_customer_tags" USING btree ("tag_id","customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "core_tags_org_type_name_key" ON "core_tags" USING btree ("org_id","type",lower("name"));