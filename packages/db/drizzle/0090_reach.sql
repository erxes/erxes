-- A role reaches the whole organisation, its members' units and the units under them, their
-- units alone, or their own records. Records name the units they are in, and row level
-- security shows a record to the callers whose reach holds it.
ALTER TABLE "core_roles" ADD COLUMN "reach" text DEFAULT 'organization' NOT NULL;--> statement-breakpoint
ALTER TABLE "core_roles" ADD CONSTRAINT "core_roles_reach_check" CHECK ("core_roles"."reach" IN ('organization', 'subtree', 'unit', 'own'));--> statement-breakpoint
ALTER TABLE "core_roles" ADD CONSTRAINT "core_roles_fixed_reach_check" CHECK (NOT ("core_roles"."key" IN ('owner', 'admin')) OR "core_roles"."reach" = 'organization');--> statement-breakpoint
-- A list from a setting `withOrg` sets (packages/db/src/tenant.ts): a Postgres array, or NULL
-- for no limit. A setting a pooled connection once had reads as '' afterwards, which is no
-- array: every read goes through here, never through a bare cast.
CREATE FUNCTION core_setting_list(name text) RETURNS text[] LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting(name, true), '')::text[]
$$;
--> statement-breakpoint
-- A record's units when an insert names none: where its maker sits (`app.units`, the calling
-- member's units). With none there either, `core_set_visible_to` gives it the organisation's
-- own unit.
CREATE FUNCTION core_new_record_unit_ids() RETURNS text[] LANGUAGE sql STABLE AS $$
  SELECT core_setting_list('app.units')
$$;
--> statement-breakpoint
-- A record's owner when an insert names none: nobody, or the calling member when their role
-- reaches only their own records (`app.owner`).
CREATE FUNCTION core_new_record_owner_id() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('app.owner', true), '')
$$;
--> statement-breakpoint
ALTER TABLE "core_companies" ALTER COLUMN "owner_id" SET DEFAULT core_new_record_owner_id();--> statement-breakpoint
ALTER TABLE "core_customers" ALTER COLUMN "owner_id" SET DEFAULT core_new_record_owner_id();--> statement-breakpoint
ALTER TABLE "core_companies" ADD COLUMN "unit_ids" text[];--> statement-breakpoint
ALTER TABLE "core_companies" ADD COLUMN "visible_to" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "core_customers" ADD COLUMN "unit_ids" text[];--> statement-breakpoint
ALTER TABLE "core_customers" ADD COLUMN "visible_to" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "core_trash" ADD COLUMN "owner_id" text;--> statement-breakpoint
ALTER TABLE "core_trash" ADD COLUMN "unit_ids" text[];--> statement-breakpoint
ALTER TABLE "core_trash" ADD COLUMN "visible_to" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
-- Whose reach holds a row: `*` the organisation, `o:<owner>`, `e:<unit>` for each of its units,
-- `u:<unit>` for those and every unit above them. A row in no unit is in the organisation's
-- own. A unit that doesn't exist is refused like a foreign key, under the name
-- `<table>_unit_ids_fkey`.
CREATE FUNCTION core_set_visible_to() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  above text[];
  found integer;
BEGIN
  IF coalesce(cardinality(NEW.unit_ids), 0) = 0 THEN
    SELECT ARRAY[id] INTO NEW.unit_ids FROM core_org_units
    WHERE org_id = NEW.org_id AND parent_id IS NULL;
  END IF;

  NEW.unit_ids := ARRAY(SELECT DISTINCT id FROM unnest(NEW.unit_ids) AS id ORDER BY id);

  SELECT array_agg(DISTINCT 'u:' || step.id), count(DISTINCT u.id) INTO above, found
  FROM core_org_units u, unnest(string_to_array(btrim(u.path, '/'), '/')) AS step(id)
  WHERE u.org_id = NEW.org_id AND u.id = ANY (NEW.unit_ids);

  IF found <> cardinality(NEW.unit_ids) THEN
    RAISE EXCEPTION USING
      ERRCODE = 'foreign_key_violation',
      MESSAGE = 'a record names a unit that does not exist',
      CONSTRAINT = TG_TABLE_NAME || '_unit_ids_fkey';
  END IF;

  NEW.visible_to := ARRAY['*']
    || CASE WHEN NEW.owner_id IS NULL THEN '{}'::text[] ELSE ARRAY['o:' || NEW.owner_id] END
    || ARRAY(SELECT 'e:' || id FROM unnest(NEW.unit_ids) AS id)
    || coalesce(above, '{}');

  RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER core_customers_visible_to BEFORE INSERT OR UPDATE OF owner_id, unit_ids, visible_to
  ON core_customers FOR EACH ROW EXECUTE FUNCTION core_set_visible_to();
--> statement-breakpoint
CREATE TRIGGER core_companies_visible_to BEFORE INSERT OR UPDATE OF owner_id, unit_ids, visible_to
  ON core_companies FOR EACH ROW EXECUTE FUNCTION core_set_visible_to();
--> statement-breakpoint
CREATE TRIGGER core_trash_visible_to BEFORE INSERT OR UPDATE OF owner_id, unit_ids, visible_to
  ON core_trash FOR EACH ROW EXECUTE FUNCTION core_set_visible_to();
--> statement-breakpoint
-- What is there goes where its owner sits, or to the organisation's own unit.
DO $$ BEGIN
  IF pg_has_role(current_user, 'erxes_core_system', 'SET') THEN
    SET LOCAL ROLE erxes_core_system;
  END IF;

  UPDATE core_customers c SET unit_ids = coalesce(
    (SELECT array_agg(m.unit_id) FROM core_org_unit_members m WHERE m.user_id = c.owner_id),
    (SELECT ARRAY[u.id] FROM core_org_units u WHERE u.org_id = c.org_id AND u.parent_id IS NULL));

  UPDATE core_companies c SET unit_ids = coalesce(
    (SELECT array_agg(m.unit_id) FROM core_org_unit_members m WHERE m.user_id = c.owner_id),
    (SELECT ARRAY[u.id] FROM core_org_units u WHERE u.org_id = c.org_id AND u.parent_id IS NULL));

  UPDATE core_trash t SET
    owner_id = (SELECT o.id FROM core_users o WHERE o.id = t.snapshot -> 'row' ->> 'ownerId'),
    unit_ids = (SELECT ARRAY[u.id] FROM core_org_units u WHERE u.org_id = t.org_id AND u.parent_id IS NULL);

  RESET ROLE;
END $$;
--> statement-breakpoint
ALTER TABLE "core_companies" ALTER COLUMN "unit_ids" SET DEFAULT core_new_record_unit_ids();--> statement-breakpoint
ALTER TABLE "core_companies" ALTER COLUMN "unit_ids" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "core_customers" ALTER COLUMN "unit_ids" SET DEFAULT core_new_record_unit_ids();--> statement-breakpoint
ALTER TABLE "core_customers" ALTER COLUMN "unit_ids" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "core_trash" ALTER COLUMN "unit_ids" SET DEFAULT core_new_record_unit_ids();--> statement-breakpoint
ALTER TABLE "core_trash" ALTER COLUMN "unit_ids" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "core_companies_visible_to_idx" ON "core_companies" USING gin ("visible_to");--> statement-breakpoint
CREATE INDEX "core_customers_visible_to_idx" ON "core_customers" USING gin ("visible_to");--> statement-breakpoint
CREATE INDEX "core_trash_visible_to_idx" ON "core_trash" USING gin ("visible_to");--> statement-breakpoint
ALTER TABLE "core_companies" ADD CONSTRAINT "core_companies_unit_ids_check" CHECK (cardinality("core_companies"."unit_ids") > 0);--> statement-breakpoint
ALTER TABLE "core_customers" ADD CONSTRAINT "core_customers_unit_ids_check" CHECK (cardinality("core_customers"."unit_ids") > 0);--> statement-breakpoint
-- A store among a thousand is a rare value: with the default 100 the planner takes it for 0.5%
-- of the table and walks the whole list for a page instead of reading the index.
ALTER TABLE core_customers ALTER COLUMN visible_to SET STATISTICS 1000;--> statement-breakpoint
ALTER TABLE core_companies ALTER COLUMN visible_to SET STATISTICS 1000;--> statement-breakpoint
-- A move changes the units above every unit under it, so the rows in them are read again.
-- It runs for whoever moved the unit, on every row: the caller's own limits are set aside.
CREATE FUNCTION core_units_moved() RETURNS trigger LANGUAGE plpgsql
  SET app.reach = '' SET app.key = '' AS $$
DECLARE
  moved text[];
BEGIN
  SELECT array_agg('e:' || a.id) INTO moved
  FROM after_units a JOIN before_units b ON b.id = a.id
  WHERE a.path IS DISTINCT FROM b.path;

  IF moved IS NOT NULL THEN
    UPDATE core_customers SET unit_ids = unit_ids WHERE visible_to && moved;
    UPDATE core_companies SET unit_ids = unit_ids WHERE visible_to && moved;
    UPDATE core_trash SET unit_ids = unit_ids WHERE visible_to && moved;
  END IF;

  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE TRIGGER core_org_units_moved AFTER UPDATE ON core_org_units
  REFERENCING OLD TABLE AS before_units NEW TABLE AS after_units
  FOR EACH STATEMENT EXECUTE FUNCTION core_units_moved();
--> statement-breakpoint
-- How many records name a unit, whoever asks: a unit that is named is never deleted.
CREATE FUNCTION core_unit_record_count(unit_id text) RETURNS bigint LANGUAGE sql STABLE
  SET app.reach = '' SET app.key = '' AS $$
  SELECT (SELECT count(*) FROM core_customers WHERE visible_to && ARRAY['e:' || unit_id])
    + (SELECT count(*) FROM core_companies WHERE visible_to && ARRAY['e:' || unit_id])
    + (SELECT count(*) FROM core_trash WHERE visible_to && ARRAY['e:' || unit_id])
$$;
--> statement-breakpoint
DROP POLICY core_api_key_rows ON core_customers;--> statement-breakpoint
DROP POLICY core_api_key_rows ON core_companies;--> statement-breakpoint
DROP FUNCTION core_key_owner_visible(text);--> statement-breakpoint
DROP FUNCTION core_key_list(text);--> statement-breakpoint
-- A caller's keys: the setting's list, or `*`, the key every row has, when nothing limits them.
-- The planner reads the value, so it knows a member who reaches everything from one who
-- reaches a single store.
CREATE FUNCTION core_reach_keys(name text) RETURNS text[] LANGUAGE sql STABLE AS $$
  SELECT coalesce(core_setting_list(name), '{*}')
$$;
--> statement-breakpoint
-- `app.reach` is the member's reach. An API key (`app.key`) adds its own limits inside it: the
-- owners, the units and the tags it names.
CREATE POLICY core_reach ON core_customers AS RESTRICTIVE
  USING (
    visible_to && core_reach_keys('app.reach')
    AND (coalesce(current_setting('app.key', true), '') = '' OR (
      visible_to && core_reach_keys('app.key_owners')
      AND visible_to && core_reach_keys('app.key_units')
      AND (core_setting_list('app.key_tags') IS NULL OR EXISTS (
        SELECT 1 FROM core_customer_tags t
        WHERE t.customer_id = core_customers.id
          AND t.tag_id = ANY (core_setting_list('app.key_tags'))
      ))
    ))
  )
  WITH CHECK (
    visible_to && core_reach_keys('app.reach')
    AND (coalesce(current_setting('app.key', true), '') = '' OR (
      visible_to && core_reach_keys('app.key_owners')
      AND visible_to && core_reach_keys('app.key_units')
    ))
  );
--> statement-breakpoint
CREATE POLICY core_reach ON core_companies AS RESTRICTIVE
  USING (
    visible_to && core_reach_keys('app.reach')
    AND (coalesce(current_setting('app.key', true), '') = '' OR (
      visible_to && core_reach_keys('app.key_owners')
      AND visible_to && core_reach_keys('app.key_units')
      AND (core_setting_list('app.key_tags') IS NULL OR EXISTS (
        SELECT 1 FROM core_company_tags t
        WHERE t.company_id = core_companies.id
          AND t.tag_id = ANY (core_setting_list('app.key_tags'))
      ))
    ))
  )
  WITH CHECK (
    visible_to && core_reach_keys('app.reach')
    AND (coalesce(current_setting('app.key', true), '') = '' OR (
      visible_to && core_reach_keys('app.key_owners')
      AND visible_to && core_reach_keys('app.key_units')
    ))
  );
--> statement-breakpoint
-- A lead's history is seen with its record: the events of customers and companies the caller
-- sees. Nothing is asked of a caller without limits.
CREATE POLICY core_reach ON core_lead_events AS RESTRICTIVE
  USING (
    (coalesce(current_setting('app.reach', true), '') = ''
      AND coalesce(current_setting('app.key', true), '') = '')
    OR EXISTS (SELECT 1 FROM core_customers c WHERE c.id = core_lead_events.customer_id)
    OR EXISTS (SELECT 1 FROM core_companies c WHERE c.id = core_lead_events.company_id)
  );
--> statement-breakpoint
-- The bin holds a record's tags inside its snapshot, so a key limited by tag sees none of it.
CREATE POLICY core_reach ON core_trash AS RESTRICTIVE
  USING (
    visible_to && core_reach_keys('app.reach')
    AND (coalesce(current_setting('app.key', true), '') = '' OR (
      visible_to && core_reach_keys('app.key_owners')
      AND visible_to && core_reach_keys('app.key_units')
      AND core_setting_list('app.key_tags') IS NULL
    ))
  )
  WITH CHECK (
    visible_to && core_reach_keys('app.reach')
    AND (coalesce(current_setting('app.key', true), '') = '' OR (
      visible_to && core_reach_keys('app.key_owners')
      AND visible_to && core_reach_keys('app.key_units')
    ))
  );
