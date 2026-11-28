-- An integration can have many connections, each with its own name. Repeated names get a number.
SELECT set_config('app.system', 'on', true);
--> statement-breakpoint
UPDATE core_integration_connections c
SET name = c.name || ' (' || d.n || ')', updated_at = now()
FROM (
  SELECT id, row_number() OVER (PARTITION BY org_id, key, lower(name) ORDER BY created_at, id) AS n
  FROM core_integration_connections
) d
WHERE c.id = d.id AND d.n > 1;
--> statement-breakpoint
SELECT set_config('app.system', '', true);
--> statement-breakpoint
CREATE UNIQUE INDEX "core_integration_connections_org_key_name_key" ON "core_integration_connections" USING btree ("org_id","key",lower("name"));
