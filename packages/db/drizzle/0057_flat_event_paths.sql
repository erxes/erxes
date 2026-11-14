-- Events carry actorType/actorId, subjectType/subjectId and entityType/entityId instead of
-- actor, subject and entity objects, and payment payloads carry referenceType/referenceId.
-- Saved automations read events by path (`event.actor.type`, `{{event.payload.reference.id}}`),
-- so their definitions move to the flat paths, and runs still going get their stored event
-- (and wait-step outputs) in the flat shape. The migration owner is bound by forced RLS, so
-- these tables stop forcing it until the rewrite is done.
ALTER TABLE core_automations NO FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_automation_versions NO FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_automation_runs NO FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
UPDATE core_automations SET definition = regexp_replace(regexp_replace(regexp_replace(regexp_replace(definition::text,
    'event\.(actor|subject|entity)\.type\M', 'event.\1Type', 'g'),
    'event\.(actor|subject|entity)\.id\M', 'event.\1Id', 'g'),
    'event\.payload\.reference\.type\M', 'event.payload.referenceType', 'g'),
    'event\.payload\.reference\.id\M', 'event.payload.referenceId', 'g')::jsonb
WHERE definition::text ~ 'event\.(actor|subject|entity|payload\.reference)\.';
--> statement-breakpoint
UPDATE core_automation_versions SET definition = regexp_replace(regexp_replace(regexp_replace(regexp_replace(definition::text,
    'event\.(actor|subject|entity)\.type\M', 'event.\1Type', 'g'),
    'event\.(actor|subject|entity)\.id\M', 'event.\1Id', 'g'),
    'event\.payload\.reference\.type\M', 'event.payload.referenceType', 'g'),
    'event\.payload\.reference\.id\M', 'event.payload.referenceId', 'g')::jsonb
WHERE definition::text ~ 'event\.(actor|subject|entity|payload\.reference)\.';
--> statement-breakpoint
-- A stored event (the run's own, or what a wait step matched) in the flat shape.
WITH flat AS (
  SELECT r.id, coalesce((
    SELECT jsonb_object_agg(part.key, CASE
      WHEN part.key = 'event' AND jsonb_typeof(part.value) = 'object' AND part.value ? 'actor'
      THEN (part.value - 'actor' - 'subject' - 'entity') || jsonb_build_object(
        'actorType', part.value -> 'actor' -> 'type',
        'actorId', part.value -> 'actor' -> 'id',
        'subjectType', part.value -> 'subject' -> 'type',
        'subjectId', part.value -> 'subject' -> 'id',
        'entityType', part.value -> 'entity' -> 'type',
        'entityId', part.value -> 'entity' -> 'id')
      WHEN part.key = 'steps' AND jsonb_typeof(part.value) = 'object' THEN coalesce((
        SELECT jsonb_object_agg(step.key, CASE
          WHEN jsonb_typeof(step.value -> 'output' -> 'event') = 'object' AND step.value -> 'output' -> 'event' ? 'actor'
          THEN jsonb_set(step.value, '{output,event}', ((step.value -> 'output' -> 'event') - 'actor' - 'subject' - 'entity') || jsonb_build_object(
            'actorType', step.value -> 'output' -> 'event' -> 'actor' -> 'type',
            'actorId', step.value -> 'output' -> 'event' -> 'actor' -> 'id',
            'subjectType', step.value -> 'output' -> 'event' -> 'subject' -> 'type',
            'subjectId', step.value -> 'output' -> 'event' -> 'subject' -> 'id',
            'entityType', step.value -> 'output' -> 'event' -> 'entity' -> 'type',
            'entityId', step.value -> 'output' -> 'event' -> 'entity' -> 'id'))
          ELSE step.value END)
        FROM jsonb_each(part.value) AS step), '{}'::jsonb)
      ELSE part.value END)
    FROM jsonb_each(r.context) AS part
  ), r.context) AS context
  FROM core_automation_runs r
  WHERE r.status IN ('running', 'waiting')
)
UPDATE core_automation_runs r SET context = flat.context FROM flat WHERE r.id = flat.id;
--> statement-breakpoint
ALTER TABLE core_automations FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_automation_versions FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_automation_runs FORCE ROW LEVEL SECURITY;
