SELECT set_config('app.system', 'on', true);
--> statement-breakpoint
-- Triggers saved before `kind` existed were `{ event, conditions }`: they are event triggers.
UPDATE core_automations
SET definition = jsonb_set(definition, '{trigger,kind}', '"event"')
WHERE definition->'trigger' ? 'event' AND NOT (definition->'trigger' ? 'kind');
--> statement-breakpoint
UPDATE core_automation_versions
SET definition = jsonb_set(definition, '{trigger,kind}', '"event"')
WHERE definition->'trigger' ? 'event' AND NOT (definition->'trigger' ? 'kind');
--> statement-breakpoint
SELECT set_config('app.system', '', true);
