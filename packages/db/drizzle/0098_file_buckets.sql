CREATE TABLE "core_file_buckets" (
	"org_id" text PRIMARY KEY DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"endpoint" text NOT NULL,
	"region" text NOT NULL,
	"bucket" text NOT NULL,
	"force_path_style" boolean NOT NULL,
	"access_key_id" text NOT NULL,
	"secret_sealed" text NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core_files" DROP CONSTRAINT "core_files_storage_check";--> statement-breakpoint
ALTER TABLE "core_file_buckets" ADD CONSTRAINT "core_file_buckets_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_files" ADD CONSTRAINT "core_files_storage_check" CHECK ("core_files"."storage" IN ('local', 's3', 'cloudflare', 'bucket', 'cloudflare_images', 'cloudflare_stream'));--> statement-breakpoint
ALTER TABLE core_file_buckets ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_file_buckets FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_file_buckets USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));