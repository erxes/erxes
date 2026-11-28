ALTER TABLE "core_integration_connections" DROP CONSTRAINT "core_integration_connections_auth_check";--> statement-breakpoint
ALTER TABLE "core_integration_connections" ADD CONSTRAINT "core_integration_connections_auth_check" CHECK ("core_integration_connections"."auth" IN ('keys', 'oauth', 'app'));--> statement-breakpoint
SELECT set_config('app.system', 'on', true);
--> statement-breakpoint
-- An organisation's GitHub connection now comes from the GitHub App. A personal access token
-- is one member's: it becomes personal to the member who added it.
UPDATE core_integration_connections c SET owner_id = c.created_by, updated_at = now()
WHERE c.key = 'github' AND c.auth = 'keys' AND c.owner_id IS NULL
  AND EXISTS (SELECT 1 FROM core_users u WHERE u.id = c.created_by AND u.org_id = c.org_id);
--> statement-breakpoint
-- One whose member is gone has no one to belong to: it is turned off.
UPDATE core_integration_connections SET status = 'disabled', updated_at = now()
WHERE key = 'github' AND auth = 'keys' AND owner_id IS NULL;
--> statement-breakpoint
SELECT set_config('app.system', '', true);
