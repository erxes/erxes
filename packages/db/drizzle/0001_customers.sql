CREATE TABLE "core_customers" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"state" text DEFAULT 'customer' NOT NULL,
	"first_name" text,
	"middle_name" text,
	"last_name" text,
	"avatar_url" text,
	"primary_email" text,
	"emails" text[] DEFAULT '{}'::text[] NOT NULL,
	"primary_phone" text,
	"phones" text[] DEFAULT '{}'::text[] NOT NULL,
	"sex" smallint,
	"birth_date" date,
	"position" text,
	"department" text,
	"code" text,
	"description" text,
	"owner_id" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_customers_state_check" CHECK ("core_customers"."state" IN ('lead', 'customer')),
	CONSTRAINT "core_customers_sex_check" CHECK ("core_customers"."sex" IN (0, 1, 2, 9))
);
--> statement-breakpoint
ALTER TABLE "core_customers" ADD CONSTRAINT "core_customers_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_customers" ADD CONSTRAINT "core_customers_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."core_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_customers_org_primary_email_key" ON "core_customers" USING btree ("org_id",lower("primary_email")) WHERE "core_customers"."primary_email" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "core_customers_org_primary_phone_key" ON "core_customers" USING btree ("org_id","primary_phone") WHERE "core_customers"."primary_phone" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_customers_org_created_idx" ON "core_customers" USING btree ("org_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "core_customers_org_state_idx" ON "core_customers" USING btree ("org_id","state");--> statement-breakpoint
CREATE INDEX "core_users_org_created_idx" ON "core_users" USING btree ("org_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);