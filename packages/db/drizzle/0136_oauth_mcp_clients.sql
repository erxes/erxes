CREATE TABLE "core_oauth_clients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"redirect_uris" text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"used_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "core_oauth_codes" ADD COLUMN "resource" text;--> statement-breakpoint
ALTER TABLE "core_oauth_refresh_tokens" ADD COLUMN "resource" text;