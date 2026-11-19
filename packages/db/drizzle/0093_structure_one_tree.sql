CREATE TABLE "core_org_unit_tombstones" (
	"org_id" text DEFAULT nullif(current_setting('app.org_id', true), '') NOT NULL,
	"id" text NOT NULL,
	"deleted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_org_unit_tombstones_pkey" PRIMARY KEY("org_id","id")
);
--> statement-breakpoint
ALTER TABLE "core_org_unit_tombstones" ADD CONSTRAINT "core_org_unit_tombstones_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."core_organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE core_org_unit_tombstones ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE core_org_unit_tombstones FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY core_tenant ON core_org_unit_tombstones USING (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id));
--> statement-breakpoint
ALTER TABLE "core_org_unit_types" DROP CONSTRAINT "core_org_unit_types_kind_check";--> statement-breakpoint
ALTER TABLE "core_org_units" DROP CONSTRAINT "core_org_units_kind_check";--> statement-breakpoint
ALTER TABLE "core_org_units" DROP CONSTRAINT "core_org_units_parent_fkey";
--> statement-breakpoint
ALTER TABLE "core_org_units" DROP CONSTRAINT "core_org_units_type_fkey";
--> statement-breakpoint
DROP INDEX "core_org_unit_types_org_id_kind_key";--> statement-breakpoint
DROP INDEX "core_org_unit_types_org_kind_code_key";--> statement-breakpoint
DROP INDEX "core_org_unit_types_org_kind_order_idx";--> statement-breakpoint
DROP INDEX "core_org_units_org_id_kind_key";--> statement-breakpoint
DROP INDEX "core_org_units_org_kind_code_key";--> statement-breakpoint
DROP INDEX "core_org_units_org_kind_path_idx";--> statement-breakpoint
ALTER TABLE "core_org_units" ALTER COLUMN "kind" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "core_org_units" ALTER COLUMN "type_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "core_org_unit_types" ADD COLUMN "plugin" text;--> statement-breakpoint
ALTER TABLE "core_org_units" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "core_org_units" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
  IF pg_has_role(current_user, 'erxes_core_system', 'SET') THEN
    SET LOCAL ROLE erxes_core_system;
  END IF;

  UPDATE core_org_units u SET code = u.code || '-2'
  WHERE u.kind = 'department' AND u.code IS NOT NULL AND EXISTS (
    SELECT 1 FROM core_org_units b
    WHERE b.org_id = u.org_id AND b.kind = 'branch' AND lower(b.code) = lower(u.code));

  UPDATE core_org_units u SET code = u.code || '-' || u.id
  WHERE u.code IS NOT NULL AND EXISTS (
    SELECT 1 FROM core_org_units o
    WHERE o.org_id = u.org_id AND o.id < u.id AND lower(o.code) = lower(u.code));

  UPDATE core_org_unit_types t SET code = t.code || '-2'
  WHERE t.kind = 'department' AND t.code IS NOT NULL AND EXISTS (
    SELECT 1 FROM core_org_unit_types b
    WHERE b.org_id = t.org_id AND b.kind = 'branch' AND lower(b.code) = lower(t.code));

  UPDATE core_org_unit_types t SET code = t.code || '-' || t.id
  WHERE t.code IS NOT NULL AND EXISTS (
    SELECT 1 FROM core_org_unit_types o
    WHERE o.org_id = t.org_id AND o.id < t.id AND lower(o.code) = lower(t.code));

  UPDATE core_org_unit_types t SET sort_order = t.sort_order + 1 + (
    SELECT coalesce(max(b.sort_order), 0) FROM core_org_unit_types b
    WHERE b.org_id = t.org_id AND b.kind = 'branch')
  WHERE t.kind = 'department';

  UPDATE core_org_units SET sort_order = 1 WHERE kind = 'department' AND parent_id IS NULL;

  WITH top AS MATERIALIZED (
    SELECT substr(md5(random()::text || o.id), 1, 17) AS id, o.id AS org_id
    FROM core_organizations o
  )
  INSERT INTO core_org_units (id, org_id, name, path)
  SELECT top.id, top.org_id, 'Organization', '/' || top.id || '/' FROM top;

  UPDATE core_org_units u SET path = '/' || top.id || u.path
  FROM core_org_units top
  WHERE top.org_id = u.org_id AND top.type_id IS NULL AND u.type_id IS NOT NULL;

  UPDATE core_org_units u SET parent_id = top.id
  FROM core_org_units top
  WHERE top.org_id = u.org_id AND top.type_id IS NULL
    AND u.type_id IS NOT NULL AND u.parent_id IS NULL;

  RESET ROLE;
END $$;
--> statement-breakpoint
ALTER TABLE "core_org_unit_types" DROP COLUMN "kind";--> statement-breakpoint
ALTER TABLE "core_org_units" DROP COLUMN "kind";--> statement-breakpoint
CREATE UNIQUE INDEX "core_org_unit_types_org_id_id_key" ON "core_org_unit_types" USING btree ("org_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "core_org_unit_types_org_code_key" ON "core_org_unit_types" USING btree ("org_id",lower("code")) WHERE "core_org_unit_types"."code" IS NOT NULL AND "core_org_unit_types"."plugin" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "core_org_unit_types_org_plugin_code_key" ON "core_org_unit_types" USING btree ("org_id","plugin","code") WHERE "core_org_unit_types"."plugin" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "core_org_unit_types_org_order_idx" ON "core_org_unit_types" USING btree ("org_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "core_org_units_org_id_id_key" ON "core_org_units" USING btree ("org_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "core_org_units_org_code_key" ON "core_org_units" USING btree ("org_id",lower("code")) WHERE "core_org_units"."code" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "core_org_units_org_root_key" ON "core_org_units" USING btree ("org_id") WHERE "core_org_units"."parent_id" IS NULL;--> statement-breakpoint
CREATE INDEX "core_org_units_org_path_idx" ON "core_org_units" USING btree ("org_id","path" text_pattern_ops);--> statement-breakpoint
CREATE INDEX "core_org_units_org_parent_order_idx" ON "core_org_units" USING btree ("org_id","parent_id","sort_order","created_at","id");--> statement-breakpoint
ALTER TABLE "core_org_units" ADD CONSTRAINT "core_org_units_parent_fkey" FOREIGN KEY ("org_id","parent_id") REFERENCES "public"."core_org_units"("org_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_org_units" ADD CONSTRAINT "core_org_units_type_fkey" FOREIGN KEY ("org_id","type_id") REFERENCES "public"."core_org_unit_types"("org_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_org_unit_types" ADD CONSTRAINT "core_org_unit_types_plugin_code_check" CHECK ("core_org_unit_types"."plugin" IS NULL OR "core_org_unit_types"."code" IS NOT NULL);--> statement-breakpoint
ALTER TABLE "core_org_units" ADD CONSTRAINT "core_org_units_root_check" CHECK (("core_org_units"."parent_id" IS NULL) = ("core_org_units"."type_id" IS NULL));--> statement-breakpoint
ALTER TABLE "core_org_units" ADD CONSTRAINT "core_org_units_id_check" CHECK (position('/' in "core_org_units"."id") = 0);--> statement-breakpoint
CREATE FUNCTION core_units_under(unit_ids text[]) RETURNS SETOF text
LANGUAGE sql STABLE AS $$
  SELECT DISTINCT d.id
  FROM core_org_units u
  JOIN core_org_units d
    ON d.org_id = u.org_id
   AND d.path ~>=~ u.path
   AND d.path ~<~ (left(u.path, -1) || '0')
  WHERE u.id = ANY (unit_ids)
$$;
