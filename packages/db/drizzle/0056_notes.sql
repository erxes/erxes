CREATE TABLE "core_note_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"note_id" text NOT NULL,
	"body" text NOT NULL,
	"edited_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_notes" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"body" text NOT NULL,
	"mentions" text[] DEFAULT '{}'::text[] NOT NULL,
	"file_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"pinned_at" timestamp with time zone,
	"edited_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "core_reactions" (
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"activity_id" text NOT NULL,
	"user_id" text NOT NULL,
	"emoji" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_reactions_pkey" PRIMARY KEY("activity_id","emoji","user_id")
);
--> statement-breakpoint
DROP INDEX "core_activities_pinned_idx";--> statement-breakpoint
ALTER TABLE "core_note_versions" ADD CONSTRAINT "core_note_versions_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "public"."core_notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_note_versions" ADD CONSTRAINT "core_note_versions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_notes" ADD CONSTRAINT "core_notes_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."core_activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_notes" ADD CONSTRAINT "core_notes_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_reactions" ADD CONSTRAINT "core_reactions_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."core_activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_reactions" ADD CONSTRAINT "core_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."core_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_reactions" ADD CONSTRAINT "core_reactions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_note_versions_note_idx" ON "core_note_versions" USING btree ("org_id","note_id","edited_at");--> statement-breakpoint
-- Notes, their history and reactions move out of core_activities.data. The
-- migration owner is bound by forced RLS (it is no superuser in production),
-- so the tables it reads and rewrites stop forcing it until the move is done.
ALTER TABLE core_activities NO FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_users NO FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_trash NO FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
INSERT INTO core_notes (id, org_id, body, mentions, file_ids, pinned_at, edited_at)
SELECT a.id, a.org_id, coalesce(a.data ->> 'body', ''),
  array(SELECT jsonb_array_elements_text(CASE WHEN jsonb_typeof(a.data -> 'mentions') = 'array' THEN a.data -> 'mentions' ELSE '[]' END)),
  array(SELECT jsonb_array_elements_text(CASE WHEN jsonb_typeof(a.data -> 'fileIds') = 'array' THEN a.data -> 'fileIds' ELSE '[]' END)),
  a.pinned_at, a.edited_at
FROM core_activities a
WHERE a.type LIKE '%.note' AND a.source = 'core';
--> statement-breakpoint
INSERT INTO core_note_versions (id, org_id, note_id, body, edited_at)
SELECT a.id || ':' || v.n, a.org_id, a.id, v.entry ->> 'body', (v.entry ->> 'editedAt')::timestamptz
FROM core_activities a
CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(a.data -> 'history') = 'array' THEN a.data -> 'history' ELSE '[]' END) WITH ORDINALITY AS v(entry, n)
WHERE a.type LIKE '%.note' AND a.source = 'core'
  AND jsonb_typeof(v.entry -> 'body') = 'string'
  AND jsonb_typeof(v.entry -> 'editedAt') = 'string';
--> statement-breakpoint
INSERT INTO core_reactions (org_id, activity_id, user_id, emoji)
SELECT a.org_id, a.id, m.user_id, r.emoji
FROM core_activities a
CROSS JOIN LATERAL jsonb_each(a.data -> 'reactions') AS r(emoji, members)
CROSS JOIN LATERAL jsonb_array_elements_text(CASE WHEN jsonb_typeof(r.members) = 'array' THEN r.members ELSE '[]' END) AS m(user_id)
WHERE jsonb_typeof(a.data -> 'reactions') = 'object'
  AND EXISTS (SELECT 1 FROM core_users u WHERE u.id = m.user_id)
ON CONFLICT DO NOTHING;
--> statement-breakpoint
UPDATE core_activities SET data = '{}' WHERE type LIKE '%.note' AND source = 'core';
--> statement-breakpoint
UPDATE core_activities SET data = data - 'reactions' WHERE data ? 'reactions';
--> statement-breakpoint
-- Deleted contacts in the bin keep their timeline as JSON: their notes,
-- versions and reactions get the same split, so a restored note keeps its text.
UPDATE core_trash t SET snapshot = t.snapshot || jsonb_build_object(
  'notes', coalesce((
    SELECT jsonb_agg(jsonb_build_object(
      'id', e ->> 'id',
      'orgId', t.org_id,
      'body', coalesce(e -> 'data' ->> 'body', ''),
      'mentions', CASE WHEN jsonb_typeof(e -> 'data' -> 'mentions') = 'array' THEN e -> 'data' -> 'mentions' ELSE '[]' END,
      'fileIds', CASE WHEN jsonb_typeof(e -> 'data' -> 'fileIds') = 'array' THEN e -> 'data' -> 'fileIds' ELSE '[]' END,
      'pinnedAt', e -> 'pinnedAt',
      'editedAt', e -> 'editedAt'))
    FROM jsonb_array_elements(t.snapshot -> 'activities') AS e
    WHERE e ->> 'type' LIKE '%.note' AND e ->> 'source' = 'core'), '[]'),
  'noteVersions', coalesce((
    SELECT jsonb_agg(jsonb_build_object(
      'id', (e ->> 'id') || ':' || v.n,
      'orgId', t.org_id,
      'noteId', e ->> 'id',
      'body', v.entry -> 'body',
      'editedAt', v.entry -> 'editedAt'))
    FROM jsonb_array_elements(t.snapshot -> 'activities') AS e
    CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(e -> 'data' -> 'history') = 'array' THEN e -> 'data' -> 'history' ELSE '[]' END) WITH ORDINALITY AS v(entry, n)
    WHERE e ->> 'type' LIKE '%.note' AND e ->> 'source' = 'core'
      AND jsonb_typeof(v.entry -> 'body') = 'string'
      AND jsonb_typeof(v.entry -> 'editedAt') = 'string'), '[]'),
  'reactions', coalesce((
    SELECT jsonb_agg(jsonb_build_object('orgId', t.org_id, 'activityId', e ->> 'id', 'userId', m.user_id, 'emoji', r.emoji))
    FROM jsonb_array_elements(t.snapshot -> 'activities') AS e
    CROSS JOIN LATERAL jsonb_each(CASE WHEN jsonb_typeof(e -> 'data' -> 'reactions') = 'object' THEN e -> 'data' -> 'reactions' ELSE '{}' END) AS r(emoji, members)
    CROSS JOIN LATERAL jsonb_array_elements_text(CASE WHEN jsonb_typeof(r.members) = 'array' THEN r.members ELSE '[]' END) AS m(user_id)), '[]'),
  'activities', coalesce((
    SELECT jsonb_agg((e - 'pinnedAt' - 'editedAt') || jsonb_build_object('data',
      CASE WHEN e ->> 'type' LIKE '%.note' AND e ->> 'source' = 'core' THEN '{}'::jsonb ELSE coalesce(e -> 'data', '{}') - 'reactions' END) ORDER BY x.n)
    FROM jsonb_array_elements(t.snapshot -> 'activities') WITH ORDINALITY AS x(e, n)), '[]')
);
--> statement-breakpoint
ALTER TABLE core_activities FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_users FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_trash FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "core_activities" DROP COLUMN "pinned_at";--> statement-breakpoint
ALTER TABLE "core_activities" DROP COLUMN "edited_at";--> statement-breakpoint
ALTER TABLE core_notes ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_notes FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_notes USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_note_versions ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_note_versions FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_note_versions USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE core_reactions ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_reactions FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_reactions USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
-- An edit, a pin or a reaction changes the entry's timeline as core_activities' own updates do.
-- A note row's id is its activity's; a reaction row names it in activity_id.
CREATE OR REPLACE FUNCTION core_activity_parts_live() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  ids text[];
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT array_agg(coalesce(to_jsonb(r) ->> 'activity_id', to_jsonb(r) ->> 'id')) INTO ids FROM old_rows r;
  ELSE
    SELECT array_agg(coalesce(to_jsonb(r) ->> 'activity_id', to_jsonb(r) ->> 'id')) INTO ids FROM new_rows r;
  END IF;

  PERFORM core_activities_live_send(c.org_id, c.targets) FROM (
    SELECT org_id, jsonb_agg(DISTINCT jsonb_build_object('t', target_type, 'i', target_id)) AS targets
    FROM core_activities WHERE id = ANY (ids) GROUP BY org_id) c;

  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE TRIGGER core_notes_live_update AFTER UPDATE ON core_notes
  REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION core_activity_parts_live();
--> statement-breakpoint
CREATE TRIGGER core_reactions_live_insert AFTER INSERT ON core_reactions
  REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION core_activity_parts_live();
--> statement-breakpoint
CREATE TRIGGER core_reactions_live_delete AFTER DELETE ON core_reactions
  REFERENCING OLD TABLE AS old_rows FOR EACH STATEMENT EXECUTE FUNCTION core_activity_parts_live();