ALTER TABLE "core_organizations" ADD COLUMN "timezone" text DEFAULT 'UTC' NOT NULL;
--> statement-breakpoint
-- Schedules run by the organisation's time zone, not one on each trigger. An organisation
-- keeps the zone its scheduled and date triggers used most, so they fire when they did; the
-- triggers lose theirs. A trigger without a zone ran in Asia/Ulaanbaatar, so it counts as that;
-- hourly ones ran on UTC's minute and count for none. A zone Postgres doesn't know becomes UTC,
-- and an organisation without such triggers keeps UTC. The migration owner is bound by forced
-- RLS until the rewrite is done.
ALTER TABLE core_organizations NO FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_automations NO FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_automation_versions NO FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
UPDATE core_organizations o SET timezone = used.zone
FROM (
  SELECT DISTINCT ON (org_id) org_id, zone
  FROM (
    SELECT a.org_id,
      CASE WHEN EXISTS (SELECT 1 FROM pg_timezone_names n WHERE n.name = t.zone)
        THEN t.zone ELSE 'UTC' END AS zone
    FROM core_automations a
    CROSS JOIN LATERAL (
      SELECT coalesce(a.definition->'trigger'->>'timezone', 'Asia/Ulaanbaatar') AS zone
    ) t
    WHERE a.definition->'trigger'->>'kind' = 'date'
      OR (a.definition->'trigger'->>'kind' = 'schedule'
        AND a.definition->'trigger'->>'every' IS DISTINCT FROM 'hour')
  ) triggers
  GROUP BY org_id, zone
  ORDER BY org_id, count(*) DESC, zone
) used
WHERE used.org_id = o.id;
--> statement-breakpoint
UPDATE core_automations SET definition = definition #- '{trigger,timezone}'
WHERE definition->'trigger' ? 'timezone';
--> statement-breakpoint
UPDATE core_automation_versions SET definition = definition #- '{trigger,timezone}'
WHERE definition->'trigger' ? 'timezone';
--> statement-breakpoint
ALTER TABLE core_organizations FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_automations FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_automation_versions FORCE ROW LEVEL SECURITY;
