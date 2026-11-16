CREATE TABLE "core_favorites" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"user_id" text NOT NULL,
	"path" text NOT NULL,
	"label" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_favorites_path_check" CHECK ("core_favorites"."path" ~ '^/[^/\s]')
);
--> statement-breakpoint
ALTER TABLE "core_favorites" ADD CONSTRAINT "core_favorites_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_favorites" ADD CONSTRAINT "core_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."core_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_favorites_org_user_path_key" ON "core_favorites" USING btree ("org_id","user_id","path");--> statement-breakpoint
ALTER TABLE core_favorites ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_favorites FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_favorites USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
