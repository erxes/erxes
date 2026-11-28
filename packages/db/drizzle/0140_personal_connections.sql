DROP INDEX "core_integration_connections_org_key_name_key";--> statement-breakpoint
ALTER TABLE "core_integration_connections" ADD COLUMN "owner_id" text;--> statement-breakpoint
ALTER TABLE "core_integration_connections" ADD CONSTRAINT "core_integration_connections_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."core_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "core_integration_connections_org_key_name_key" ON "core_integration_connections" USING btree ("org_id","key",lower("name"),coalesce("owner_id", ''));