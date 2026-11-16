-- Integrations (eBarimt) get their own permission. Roles that set them up
-- with payments.manage until now keep doing so.
SELECT set_config('app.system', 'on', true);
--> statement-breakpoint
UPDATE core_roles
SET permissions = array_append(permissions, 'integrations.manage'), updated_at = now()
WHERE 'payments.manage' = ANY(permissions) AND NOT 'integrations.manage' = ANY(permissions);
--> statement-breakpoint
SELECT set_config('app.system', '', true);
