-- Customer keys come in two kinds: a server's secret key, and a publishable key that web and mobile apps ship.
ALTER TABLE "core_portal_keys" ADD COLUMN "kind" text DEFAULT 'secret' NOT NULL;--> statement-breakpoint
ALTER TABLE "core_portal_keys" ADD COLUMN "key" text;--> statement-breakpoint
ALTER TABLE "core_portal_keys" ADD CONSTRAINT "core_portal_keys_kind_check" CHECK ("core_portal_keys"."kind" IN ('secret', 'publishable'));