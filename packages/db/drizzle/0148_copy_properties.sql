-- Custom properties move into Data Extensions (DE) with the same ids: groups become
-- core_data_field_groups, fields core_data_fields, and the values of customers', companies' and
-- products' fields columns of each organisation's `ext_core_<type>` table, made by the
-- core_data_* functions as the API makes them; binned records' values come from their recycle
-- bin snapshots, so a restore brings them back. A plugin's record type keeps only the definitions:
-- the plugin keeps its records' values by the same field ids. Saved views, automations,
-- broadcasts, imports and exports that named a field by id name its DE path instead. A value
-- that doesn't fit its DE type is dropped and counted in a NOTICE. The next migration drops the
-- old tables. The helpers below are dropped at the end.

-- The DE record type of an old content type.
CREATE FUNCTION core_props_record_type(p text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN p IN ('customer', 'company', 'product') THEN 'core.' || p ELSE p END
$$;
--> statement-breakpoint
-- The DE type of an old field: text with a format takes the type of the format.
CREATE FUNCTION core_props_type(p_type text, p_validation text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE p_type
    WHEN 'text' THEN coalesce(p_validation, 'text')
    WHEN 'textarea' THEN 'longText'
    WHEN 'radio' THEN 'select'
    WHEN 'multiselect' THEN 'multiSelect'
    WHEN 'check' THEN 'multiSelect'
    WHEN 'list' THEN 'textList'
    ELSE p_type
  END
$$;
--> statement-breakpoint
-- The column type a DE type keeps (columns.ts).
CREATE FUNCTION core_props_column_type(p_type text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE p_type
    WHEN 'number' THEN 'numeric'
    WHEN 'boolean' THEN 'boolean'
    WHEN 'date' THEN 'date'
    WHEN 'multiSelect' THEN 'text[]'
    WHEN 'textList' THEN 'text[]'
    ELSE 'text'
  END
$$;
--> statement-breakpoint
-- An option's text as a select's value, as plugin fields' options are made: characters a value
-- can't hold become spaces.
CREATE FUNCTION core_props_option(p text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT nullif(btrim(left(btrim(regexp_replace(p, '[,{}"\\]', ' ', 'g')), 100)), '')
$$;
--> statement-breakpoint
-- Text as a camelCase key (`Favourite colour` → `favouriteColour`), or null when nothing is left.
CREATE FUNCTION core_props_camel(p text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT nullif(string_agg(CASE WHEN rn = 1 THEN w ELSE initcap(w) END, '' ORDER BY rn), '')
  FROM (
    SELECT w, row_number() OVER (ORDER BY n) AS rn
    FROM unnest(regexp_split_to_array(lower(coalesce(p, '')), '[^a-z0-9]+')) WITH ORDINALITY AS t(w, n)
    WHERE w <> ''
  ) words
$$;
--> statement-breakpoint
-- A key the record type has free: the code when it is a valid key, else one made from the code
-- or the label, numbered while taken by another field or one of the record type's own.
CREATE FUNCTION core_props_key(p_org text, p_record_type text, p_code text, p_label text)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  v_reserved text[] := CASE p_record_type
    WHEN 'core.customer' THEN ARRAY['firstName', 'lastName', 'birthDate', 'position', 'department',
      'primaryEmail', 'primaryPhone', 'code', 'state', 'source', 'ownerId', 'createdAt', 'lastActivityAt']
    WHEN 'core.company' THEN ARRAY['primaryName', 'website', 'industry', 'size', 'businessType',
      'primaryEmail', 'primaryPhone', 'code', 'state', 'source', 'ownerId', 'createdAt', 'lastActivityAt']
    WHEN 'core.product' THEN ARRAY['name', 'code', 'barcode', 'kind', 'status', 'unit', 'price',
      'currency', 'weightGrams', 'createdAt']
    ELSE ARRAY[]::text[]
  END;
  v_base text;
  v_key text;
  v_n int := 1;
BEGIN
  v_base := CASE WHEN p_code ~ '^[a-z][a-zA-Z0-9_]{0,49}$' THEN p_code
    ELSE coalesce(core_props_camel(p_code), core_props_camel(p_label), 'field') END;
  IF v_base !~ '^[a-z]' THEN
    v_base := 'field' || initcap(v_base);
  END IF;
  v_base := left(v_base, 45);
  v_key := v_base;
  WHILE v_key = ANY(v_reserved) OR EXISTS (
    SELECT 1 FROM core_data_fields
    WHERE org_id = p_org AND record_type = p_record_type AND key = v_key
  ) LOOP
    v_n := v_n + 1;
    v_key := v_base || v_n;
  END LOOP;
  RETURN v_key;
END $$;
--> statement-breakpoint
-- A new field's column, as freeColumn (columns.ts) names it: the key in snake case, numbered
-- while the record type has it or it is one of the tables' own.
CREATE FUNCTION core_props_column(p_org text, p_record_type text, p_key text) RETURNS text
LANGUAGE plpgsql AS $$
DECLARE
  v_system text[] := ARRAY['id', 'org_id', 'position', 'search', 'created_by', 'updated_by',
    'created_at', 'updated_at', 'deleted_at', 'record_id', 'source_id', 'target_id'];
  v_base text := left(regexp_replace(lower(regexp_replace(p_key, '([a-z0-9])([A-Z])', '\1_\2', 'g')),
    '[^a-z0-9_]', '_', 'g'), 45);
  v_column text := v_base;
  v_n int := 1;
BEGIN
  WHILE v_column = ANY(v_system) OR (v_column || '_id') = ANY(v_system) OR EXISTS (
    SELECT 1 FROM core_data_fields
    WHERE org_id = p_org AND record_type = p_record_type AND "column" = v_column
  ) LOOP
    v_n := v_n + 1;
    v_column := v_base || '_' || v_n;
  END LOOP;
  RETURN v_column;
END $$;
--> statement-breakpoint
-- The values table a core record type's fields' table is, made with its first field as
-- ensureTable (definitions.ts) makes it.
CREATE FUNCTION core_props_table(p_org text, p_record_type text) RETURNS text
LANGUAGE plpgsql AS $$
DECLARE
  v_base text := left('ext_' || replace(p_record_type, '.', '_'), 48);
  v_table text;
  v_n int := 1;
BEGIN
  SELECT table_name INTO v_table FROM core_data_tables
  WHERE org_id = p_org AND record_type = p_record_type;
  IF v_table IS NOT NULL THEN
    RETURN v_table;
  END IF;
  v_table := v_base;
  WHILE EXISTS (SELECT 1 FROM core_data_tables WHERE org_id = p_org AND table_name = v_table) LOOP
    v_n := v_n + 1;
    v_table := left(v_base, 48 - length('_' || v_n)) || '_' || v_n;
  END LOOP;
  PERFORM core_data_create_table(v_table, 'host');
  INSERT INTO core_data_tables (org_id, record_type, table_name, kind)
  VALUES (p_org, p_record_type, v_table, 'host');
  RETURN v_table;
END $$;
--> statement-breakpoint
-- Old fields and the DE field each became: the same id, or the field a plugin's manifest made
-- already with the same code.
CREATE FUNCTION core_props_map(p_org text)
RETURNS TABLE (old_id text, field_id text, record_type text, key text, type text, "column" text)
LANGUAGE sql STABLE AS $$
  SELECT f.id, d.id, d.record_type, d.key, d.type, d."column"
  FROM core_fields f
  JOIN core_data_fields d ON d.org_id = f.org_id AND (d.id = f.id OR (
    f.plugin IS NOT NULL AND d.plugin = f.plugin AND d.key = f.code
    AND d.record_type = core_props_record_type(f.content_type)))
  WHERE f.org_id = p_org
$$;
--> statement-breakpoint
-- A text value as a DE type holds it, or null when it doesn't fit.
CREATE FUNCTION core_props_text(p text, p_type text) RETURNS text
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v text := btrim(p);
BEGIN
  RETURN CASE p_type
    WHEN 'email' THEN CASE WHEN length(v) <= 254 AND lower(v) ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN lower(v) END
    WHEN 'phone' THEN CASE WHEN length(v) BETWEEN 3 AND 32 AND v ~ '^\+?[0-9 ()-]+$' THEN v END
    WHEN 'longText' THEN CASE WHEN length(v) BETWEEN 1 AND 20000 THEN v END
    ELSE CASE WHEN length(v) BETWEEN 1 AND 2000 THEN v END
  END;
END $$;
--> statement-breakpoint
CREATE FUNCTION core_props_date(p text) RETURNS date
LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  RETURN btrim(p)::date;
EXCEPTION WHEN others THEN
  RETURN NULL;
END $$;
--> statement-breakpoint
-- The SQL that reads one record's value of an old field (`v`), by its DE type, from a values
-- table's rows `o`: null when it doesn't fit.
CREATE FUNCTION core_props_value_sql(p_type text, p_old_type text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_type = 'number' AND p_old_type = 'text' THEN
      $s$CASE WHEN btrim(o.text_value) ~ '^-?\d+([.,]\d+)?$' THEN replace(btrim(o.text_value), ',', '.')::numeric END$s$
    WHEN p_type = 'number' THEN 'o.number_value::numeric'
    WHEN p_type = 'date' AND p_old_type = 'text' THEN 'core_props_date(o.text_value)'
    WHEN p_type = 'date' THEN 'o.date_value'
    WHEN p_type = 'boolean' THEN 'o.bool_value'
    WHEN p_type = 'select' THEN
      'CASE WHEN core_props_option(o.text_value) = ANY($3) THEN core_props_option(o.text_value) END'
    ELSE format('core_props_text(o.text_value, %L)', p_type)
  END
$$;
--> statement-breakpoint
-- Copies an old field's values from `p_source` (a values table, or the binned records' values)
-- into its DE column; returns how many didn't fit.
CREATE FUNCTION core_props_copy_values(
  p_org text, p_source text, p_old_id text, p_old_type text, p_type text, p_table text,
  p_column text, p_options text[]
) RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE
  v_source text := p_source;
  v_schema text := 'data_' || p_org;
  v_total bigint;
  v_copied bigint;
BEGIN
  EXECUTE format('SELECT count(*) FROM %I WHERE org_id = $1 AND field_id = $2', v_source)
    INTO v_total USING p_org, p_old_id;
  IF v_total = 0 THEN
    RETURN 0;
  END IF;
  IF p_type IN ('multiSelect', 'textList') THEN
    -- Items in order, at most 50: a multi-select's among its options and each once.
    EXECUTE format($q$
      WITH items AS (
        SELECT record_id, item, position FROM (
          SELECT o.record_id, o.position, x.item,
            row_number() OVER (PARTITION BY o.record_id, x.item ORDER BY o.position) AS seen
          FROM %1$I o, LATERAL (SELECT CASE WHEN $4 = 'multiSelect'
            THEN CASE WHEN core_props_option(o.text_value) = ANY($3) THEN core_props_option(o.text_value) END
            ELSE core_props_text(o.text_value, 'text') END AS item) x
          WHERE o.org_id = $1 AND o.field_id = $2
        ) y WHERE item IS NOT NULL AND ($4 = 'textList' OR seen = 1)
      ), lists AS (
        SELECT record_id, (array_agg(item ORDER BY position))[1:50] AS v FROM items GROUP BY record_id
      ), written AS (
        INSERT INTO %2$I.%3$I AS t (record_id, org_id, %4$I) SELECT record_id, $1, v FROM lists
        ON CONFLICT (record_id) DO UPDATE SET %4$I = EXCLUDED.%4$I
        RETURNING cardinality(t.%4$I) AS n
      )
      SELECT coalesce(sum(n), 0) FROM written
    $q$, v_source, v_schema, p_table, p_column)
      INTO v_copied USING p_org, p_old_id, p_options, p_type;
  ELSE
    EXECUTE format($q$
      WITH vals AS (
        SELECT o.record_id, %5$s AS v FROM %1$I o
        WHERE o.org_id = $1 AND o.field_id = $2 AND o.position = 0
      ), written AS (
        INSERT INTO %2$I.%3$I (record_id, org_id, %4$I)
        SELECT record_id, $1, v FROM vals WHERE v IS NOT NULL
        ON CONFLICT (record_id) DO UPDATE SET %4$I = EXCLUDED.%4$I
        RETURNING 1
      )
      SELECT count(*) FROM written
    $q$, v_source, v_schema, p_table, p_column, core_props_value_sql(p_type, p_old_type))
      INTO v_copied USING p_org, p_old_id, p_options;
  END IF;
  RETURN v_total - v_copied;
END $$;
--> statement-breakpoint
-- An old logic rule's value as the DE field it names compares it: a number or yes/no as such,
-- an option as its value.
CREATE FUNCTION core_props_rule_value(p_value text, p_type text) RETURNS jsonb
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_value IS NULL THEN NULL
    WHEN p_type = 'number' AND btrim(p_value) ~ '^-?\d+(\.\d+)?$' THEN to_jsonb(btrim(p_value)::numeric)
    WHEN p_type = 'boolean' AND lower(btrim(p_value)) IN ('true', 'false') THEN to_jsonb(lower(btrim(p_value))::boolean)
    WHEN p_type IN ('select', 'multiSelect') THEN to_jsonb(coalesce(core_props_option(p_value), p_value))
    ELSE to_jsonb(p_value)
  END
$$;
--> statement-breakpoint
-- An old field's logic as a DE condition over the keys of the fields its rules name; rules on
-- fields that are gone are left out.
CREATE FUNCTION core_props_condition(p_org text, p_record_type text, p_logic jsonb) RETURNS jsonb
LANGUAGE sql STABLE AS $$
  SELECT CASE WHEN count(*) > 0 THEN jsonb_build_object('match', 'all', 'rules', jsonb_agg(
    jsonb_strip_nulls(jsonb_build_object(
      'field', m.key,
      'operator', CASE r.rule->>'operator'
        WHEN 'is' THEN 'eq' WHEN 'isNot' THEN 'neq' WHEN 'hasValue' THEN 'isNotEmpty'
        ELSE r.rule->>'operator' END,
      'value', CASE WHEN r.rule->>'operator' IN ('hasValue', 'isEmpty') THEN NULL
        ELSE core_props_rule_value(r.rule->>'value', m.type) END
    )) ORDER BY r.n)) END
  FROM jsonb_array_elements(p_logic->'rules') WITH ORDINALITY AS r(rule, n)
  JOIN core_props_map(p_org) m ON m.old_id = r.rule->>'fieldId' AND m.record_type = p_record_type
$$;
--> statement-breakpoint
-- An old field's group, as the DE group it became: the same id, or the group with its code.
CREATE FUNCTION core_props_group(p_org text, p_record_type text, p_group_id text) RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT coalesce(
    (SELECT id FROM core_data_field_groups WHERE id = p_group_id),
    (SELECT d.id FROM core_data_field_groups d JOIN core_field_groups g ON g.id = p_group_id
      WHERE d.org_id = p_org AND d.record_type = p_record_type AND lower(d.code) = lower(g.code)))
$$;
--> statement-breakpoint
-- One organisation's old field as a DE field with the same id, and its column. A plugin's
-- field its manifest made already in DE is kept as it is.
CREATE FUNCTION core_props_copy_field(p_org text, f core_fields) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  v_record_type text := core_props_record_type(f.content_type);
  v_type text := core_props_type(f.type, f.validation);
  v_key text;
  v_column text;
BEGIN
  IF EXISTS (SELECT 1 FROM core_props_map(p_org) WHERE old_id = f.id) THEN
    RETURN;
  END IF;
  v_key := CASE WHEN f.plugin IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM core_data_fields WHERE org_id = p_org AND record_type = v_record_type AND key = f.code
    ) THEN f.code ELSE core_props_key(p_org, v_record_type, f.code, f.label) END;
  v_column := core_props_column(p_org, v_record_type, v_key);
  INSERT INTO core_data_fields (id, org_id, record_type, key, label, description, icon, type,
    "column", options, settings, group_id, plugin, position, status, created_at, updated_at)
  VALUES (f.id, p_org, v_record_type, v_key, coalesce(nullif(left(btrim(f.label), 120), ''), v_key),
    nullif(left(btrim(coalesce(f.description, '')), 500), ''),
    CASE WHEN f.icon ~ '^Icon[A-Za-z0-9]+$' AND length(f.icon) <= 60 THEN f.icon END,
    v_type, v_column,
    CASE WHEN v_type IN ('select', 'multiSelect') THEN (
      SELECT coalesce(jsonb_agg(jsonb_build_object('value', v, 'label', l, 'color', 'gray') ORDER BY n), '[]')
      FROM (
        SELECT DISTINCT ON (v) v, left(btrim(o), 120) AS l, n
        FROM unnest(f.options) WITH ORDINALITY AS t(o, n), core_props_option(o) AS v
        WHERE v IS NOT NULL ORDER BY v, n
      ) opts
    ) ELSE '[]'::jsonb END,
    jsonb_strip_nulls(jsonb_build_object(
      'hidden', CASE WHEN NOT f.is_visible THEN true END,
      'required', CASE WHEN f.is_required THEN true END,
      'showInCreate', CASE WHEN NOT f.is_visible_to_create THEN false END,
      'filterable', CASE WHEN NOT f.filterable THEN false END,
      'readOnly', CASE WHEN f.plugin IS NOT NULL THEN true END,
      'customerEditable', CASE WHEN f.customer_editable AND f.content_type = 'customer'
        AND f.plugin IS NULL THEN true END
    )),
    core_props_group(p_org, v_record_type, f.group_id), f.plugin, f."order",
    CASE WHEN f.archived_at IS NULL THEN 'active' ELSE 'archived' END, f.created_at, f.updated_at);
  IF f.content_type IN ('customer', 'company', 'product') THEN
    PERFORM core_data_add_column(core_props_table(p_org, v_record_type), v_column,
      core_props_column_type(v_type), false);
  END IF;
END $$;
--> statement-breakpoint
-- Walks a stored JSON value: a date trigger on an old field, and the old "set a custom field"
-- action, name the DE field by its key.
CREATE FUNCTION core_props_walk(p jsonb, p_keys jsonb) RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v jsonb;
BEGIN
  IF jsonb_typeof(p) = 'array' THEN
    SELECT coalesce(jsonb_agg(core_props_walk(e, p_keys) ORDER BY i), '[]'::jsonb) INTO v
    FROM jsonb_array_elements(p) WITH ORDINALITY AS t(e, i);
    RETURN v;
  END IF;
  IF jsonb_typeof(p) IS DISTINCT FROM 'object' THEN
    RETURN p;
  END IF;
  SELECT coalesce(jsonb_object_agg(k, core_props_walk(e, p_keys)), '{}'::jsonb) INTO v
  FROM jsonb_each(p) AS t(k, e);
  IF v->>'kind' = 'date' AND p_keys ? (v->>'field') THEN
    v := v || jsonb_build_object('field', 'data.' || (p_keys->>(v->>'field')));
  END IF;
  IF v->>'type' = 'action' AND v->>'action' = 'core.customer.set_field'
    AND p_keys ? (v->'input'->>'fieldId') THEN
    v := v || jsonb_build_object('action', 'core.customer.set_data_value',
      'input', ((v->'input') - 'fieldId') || jsonb_build_object('field', p_keys->>(v->'input'->>'fieldId')));
  END IF;
  RETURN v;
END $$;
--> statement-breakpoint
-- A stored JSON value with every old path of a core field as its DE path: `customFields.<id>`
-- (filters, templates, sorts, import and export columns) as `data.<key>`, and a list column
-- `field:<id>` as `data.<key>`.
CREATE FUNCTION core_props_rewrite(p jsonb, p_keys jsonb) RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v text;
  k text;
BEGIN
  IF p IS NULL THEN
    RETURN NULL;
  END IF;
  v := p::text;
  FOR k IN SELECT jsonb_object_keys(p_keys) LOOP
    v := regexp_replace(v, 'customFields\.' || regexp_replace(k, '([^A-Za-z0-9])', '\\\1', 'g')
      || '(?![A-Za-z0-9_-])', 'data.' || (p_keys->>k), 'g');
    v := replace(v, '"field:' || k || '"', '"data.' || (p_keys->>k) || '"');
  END LOOP;
  RETURN core_props_walk(v::jsonb, p_keys);
END $$;
--> statement-breakpoint
-- One organisation's properties, copied.
CREATE FUNCTION core_props_copy(p_org text) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  f core_fields;
  m record;
  v_dropped bigint;
  v_keys jsonb;
  v_condition jsonb;
BEGIN
  PERFORM set_config('app.org_id', p_org, true);

  INSERT INTO core_data_field_groups (id, org_id, record_type, label, code, description, position,
    applies_to, archived_at, created_at, updated_at)
  SELECT g.id, g.org_id, core_props_record_type(g.content_type), left(g.name, 120), g.code,
    g.description, g."order",
    CASE WHEN g.content_type IN ('customer', 'company', 'product') THEN '{}'::jsonb ELSE g.applies_to END,
    g.archived_at, g.created_at, g.updated_at
  FROM core_field_groups g WHERE g.org_id = p_org
  ON CONFLICT DO NOTHING;

  -- A plugin's fields first, so they keep their codes as keys.
  FOR f IN SELECT * FROM core_fields WHERE org_id = p_org
    ORDER BY plugin IS NULL, content_type, "order", created_at, id
  LOOP
    PERFORM core_props_copy_field(p_org, f);
  END LOOP;

  FOR f IN SELECT * FROM core_fields WHERE org_id = p_org AND logic IS NOT NULL LOOP
    v_condition := core_props_condition(p_org, core_props_record_type(f.content_type), f.logic);
    IF v_condition IS NOT NULL THEN
      UPDATE core_data_fields SET settings = settings || jsonb_build_object(
        CASE WHEN f.logic->>'action' = 'hide' THEN 'hiddenWhen' ELSE 'visibleWhen' END, v_condition)
      WHERE id = f.id;
    END IF;
  END LOOP;

  -- Records in the recycle bin keep their values in DE too, so a restore brings them back.
  FOR m IN SELECT p.*, o.type AS old_type, core_props_table(p_org, p.record_type) AS host,
      ARRAY(SELECT x->>'value' FROM jsonb_array_elements(d.options) AS x) AS choices
    FROM core_props_map(p_org) p
    JOIN core_fields o ON o.id = p.old_id
    JOIN core_data_fields d ON d.id = p.field_id
    WHERE p.record_type LIKE 'core.%'
  LOOP
    v_dropped := core_props_copy_values(p_org, 'core_' || split_part(m.record_type, '.', 2)
        || '_field_values', m.old_id, m.old_type, m.type, m.host, m."column", m.choices)
      + core_props_copy_values(p_org, 'core_props_binned', m.old_id, m.old_type, m.type, m.host,
        m."column", m.choices);
    IF v_dropped > 0 THEN
      RAISE NOTICE 'Data Extensions copy: organisation %, field % (%, %): % values did not fit and were dropped',
        p_org, m.key, m.old_id, m.type, v_dropped;
    END IF;
  END LOOP;

  -- Every field's, a plugin record type's too: a plugin's list (a ticket view) filters and sorts
  -- by `data.<key>` as core's do. Ids are unique, so each path names one field.
  SELECT jsonb_object_agg(old_id, key) INTO v_keys
  FROM core_props_map(p_org);
  IF v_keys IS NULL THEN
    RETURN;
  END IF;

  UPDATE core_views SET filter = core_props_rewrite(filter, v_keys),
    columns = core_props_rewrite(columns, v_keys), sort = core_props_rewrite(sort, v_keys)
  WHERE org_id = p_org;
  UPDATE core_automations SET definition = core_props_rewrite(definition, v_keys) WHERE org_id = p_org;
  UPDATE core_automation_versions SET definition = core_props_rewrite(definition, v_keys)
  WHERE org_id = p_org;
  UPDATE core_broadcasts SET filter = core_props_rewrite(filter, v_keys) WHERE org_id = p_org;
  UPDATE core_imports SET mapping = core_props_rewrite(mapping, v_keys) WHERE org_id = p_org;
  UPDATE core_exports SET query = core_props_rewrite(query, v_keys),
    columns = core_props_rewrite(columns, v_keys)
  WHERE org_id = p_org;
END $$;
--> statement-breakpoint
DO $$
DECLARE
  v_org text;
BEGIN
  PERFORM set_config('app.system', 'on', true);
  -- The values of binned customers and companies, from their snapshots, in the values tables' shape.
  CREATE TEMP TABLE core_props_binned ON COMMIT DROP AS
  SELECT t.org_id, t.record_id, kv.key AS field_id, coalesce(e.n - 1, 0)::smallint AS position,
    coalesce(e.v, kv.value) #>> '{}' AS text_value,
    CASE WHEN jsonb_typeof(kv.value) = 'number' THEN (kv.value #>> '{}')::double precision END AS number_value,
    CASE WHEN jsonb_typeof(kv.value) = 'string' THEN core_props_date(kv.value #>> '{}') END AS date_value,
    CASE WHEN jsonb_typeof(kv.value) = 'boolean' THEN (kv.value #>> '{}')::boolean END AS bool_value
  FROM core_trash t
  CROSS JOIN LATERAL jsonb_each(CASE WHEN jsonb_typeof(t.snapshot->'row'->'customFields') = 'object'
    THEN t.snapshot->'row'->'customFields' ELSE '{}'::jsonb END) AS kv
  LEFT JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(kv.value) = 'array' THEN kv.value END)
    WITH ORDINALITY AS e(v, n) ON true;
  FOR v_org IN SELECT DISTINCT org_id FROM (
    SELECT org_id FROM core_field_groups UNION SELECT org_id FROM core_fields
  ) orgs ORDER BY org_id LOOP
    PERFORM core_props_copy(v_org);
  END LOOP;
  PERFORM set_config('app.org_id', '', true);
  PERFORM set_config('app.system', '', true);
END $$;
--> statement-breakpoint
DROP FUNCTION core_props_copy(text), core_props_rewrite(jsonb, jsonb), core_props_walk(jsonb, jsonb),
  core_props_copy_field(text, core_fields), core_props_group(text, text, text),
  core_props_condition(text, text, jsonb), core_props_rule_value(text, text),
  core_props_copy_values(text, text, text, text, text, text, text, text[]),
  core_props_value_sql(text, text), core_props_date(text), core_props_text(text, text),
  core_props_map(text), core_props_table(text, text), core_props_column(text, text, text),
  core_props_key(text, text, text, text), core_props_camel(text), core_props_option(text),
  core_props_column_type(text), core_props_type(text, text), core_props_record_type(text);
