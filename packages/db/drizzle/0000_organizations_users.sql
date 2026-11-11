CREATE TABLE "core_organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"subdomain" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_users" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"email" text NOT NULL,
	"username" text,
	"full_name" text,
	"avatar_url" text,
	"role" text DEFAULT 'member' NOT NULL,
	"status" text DEFAULT 'invited' NOT NULL,
	"password_hash" text,
	"invited_by" text,
	"is_support" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_users_role_check" CHECK ("core_users"."role" IN ('owner', 'admin', 'member')),
	CONSTRAINT "core_users_status_check" CHECK ("core_users"."status" IN ('invited', 'active', 'disabled'))
);
--> statement-breakpoint
ALTER TABLE "core_users" ADD CONSTRAINT "core_users_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_organizations_subdomain_key" ON "core_organizations" USING btree (lower("subdomain"));--> statement-breakpoint
CREATE UNIQUE INDEX "core_users_org_email_key" ON "core_users" USING btree ("org_id",lower("email"));--> statement-breakpoint
CREATE INDEX "core_users_org_status_idx" ON "core_users" USING btree ("org_id","status");