DROP INDEX "core_assistant_connections_user_provider_key";--> statement-breakpoint
DROP INDEX "core_assistant_connections_user_default_key";--> statement-breakpoint
-- Keys move from each member to the organisation: the newest key per provider stays, and the
-- default is the newest default's provider.
DELETE FROM "core_assistant_connections" c USING "core_assistant_connections" newer
  WHERE newer.org_id = c.org_id AND newer.provider = c.provider
    AND (newer.updated_at, newer.id) > (c.updated_at, c.id);--> statement-breakpoint
UPDATE "core_assistant_connections" c SET is_default = false
  WHERE c.is_default AND EXISTS (
    SELECT 1 FROM "core_assistant_connections" newer
    WHERE newer.org_id = c.org_id AND newer.is_default
      AND (newer.updated_at, newer.id) > (c.updated_at, c.id)
  );--> statement-breakpoint
CREATE UNIQUE INDEX "core_assistant_connections_provider_key" ON "core_assistant_connections" USING btree ("org_id","provider");--> statement-breakpoint
CREATE UNIQUE INDEX "core_assistant_connections_default_key" ON "core_assistant_connections" USING btree ("org_id") WHERE "core_assistant_connections"."is_default";--> statement-breakpoint
ALTER TABLE "core_assistant_connections" DROP COLUMN "user_id";