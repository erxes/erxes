/**
 * Custom field groups and fields of every old record type → `core_field_groups` and
 * `core_fields`, keeping their ids. Plugin record types use the plugin's timeline type
 * (`operation.task`), so plugin importers find their fields by the old id. `properties_*` is
 * 3.4's copy; `fields_groups` holds older groups it didn't copy. Form fields (no content type)
 * are Frontline's forms. Labels and group codes are unique per record type, so a repeat gets a
 * number. Every field gets an id map row (kind `field`), its id unchanged.
 */
import { z } from 'zod';
import { remember } from './idMap';
import { insert, MINE, readAll, type Run, unit } from './run';
import { inOrder } from '~/lib/sequence';
import { createdOf, field, flag, idOf, optionalId, readOr, record, text, when } from './values';

/** Old content types → core's record types. */
const CONTENT_TYPES: Record<string, string> = {
  'core:customer': 'customer',
  'contacts:customer': 'customer',
  'core:lead': 'customer',
  'contacts:lead': 'customer',
  'core:company': 'company',
  'contacts:company': 'company',
  'core:product': 'product',
  'products:product': 'product',
  'sales:deal': 'sales.deal',
  'cards:deal': 'sales.deal',
  'tasks:task': 'operation.task',
  'cards:task': 'operation.task',
  'operation:task': 'operation.task',
  'operation:project': 'operation.project',
  'tickets:ticket': 'frontline.ticket',
  'cards:ticket': 'frontline.ticket',
  'frontline:ticket': 'frontline.ticket',
  'inbox:conversation': 'frontline.conversation',
  'frontline:conversation': 'frontline.conversation',
};

/** Old field types → core's. Types with no match of their own keep their value as text. */
const FIELD_TYPES: Record<string, { type: string; validation: string | null }> = {
  text: { type: 'text', validation: null },
  textarea: { type: 'textarea', validation: null },
  html: { type: 'textarea', validation: null },
  description: { type: 'textarea', validation: null },
  number: { type: 'number', validation: null },
  date: { type: 'date', validation: null },
  select: { type: 'select', validation: null },
  multiSelect: { type: 'multiselect', validation: null },
  radio: { type: 'radio', validation: null },
  check: { type: 'check', validation: null },
  phone: { type: 'phone', validation: null },
  internationalPhone: { type: 'phone', validation: null },
  email: { type: 'text', validation: 'email' },
  objectList: { type: 'list', validation: null },
  file: { type: 'text', validation: null },
  code: { type: 'text', validation: null },
  location: { type: 'text', validation: null },
  map: { type: 'text', validation: null },
  'core:customer': { type: 'text', validation: null },
  'operation:project': { type: 'text', validation: null },
  'relation:core:company': { type: 'text', validation: null },
  'relation:core:customer': { type: 'text', validation: null },
  'relation:core:product': { type: 'text', validation: null },
  'relation:core:user': { type: 'text', validation: null },
};

const LabelledOption = z.object({ label: text, value: text });

/** An option's value and what people see. */
const optionOf = (value: unknown) => {
  if (typeof value === 'string' && value.trim())
    return { value: value.trim(), label: value.trim() };

  const parsed = LabelledOption.safeParse(value);
  const label = parsed.success ? (parsed.data.label ?? parsed.data.value) : null;

  return parsed.success && label ? { value: parsed.data.value ?? label, label } : null;
};

const options = field((value) =>
  Array.isArray(value) ? value.flatMap((item) => optionOf(item) ?? []) : [],
);

const Configs = field((value) => {
  const parsed = z
    .object({ isVisible: flag, isVisibleToCreate: flag, isRequired: flag })
    .safeParse(value ?? {});

  return parsed.success
    ? parsed.data
    : { isVisible: null, isVisibleToCreate: null, isRequired: null };
});

const order = field((value) => (typeof value === 'number' ? Math.round(value) : 0));

const Group = record({
  name: text,
  code: text,
  description: text,
  contentType: text,
  order,
  createdAt: when,
  updatedAt: when,
});

export const FieldDocument = record({
  name: text,
  text: text,
  code: text,
  description: text,
  contentType: text,
  type: text,
  groupId: optionalId,
  order,
  options,
  configs: Configs,
  isVisible: flag,
  isVisibleToCreate: flag,
  isRequired: flag,
  icon: text,
  archivedAt: when,
  createdAt: when,
  updatedAt: when,
});

export type FieldDocument = z.infer<typeof FieldDocument>;

/** A label or code not yet used for the record type: a repeat gets ` 2`, ` 3` … */
export const uniqueIn = (taken: Set<string>, scope: string, wanted: string) => {
  let candidate = wanted;

  for (let n = 2; taken.has(`${scope}:${candidate.toLowerCase()}`); n += 1) {
    candidate = `${wanted} ${n}`;
  }

  taken.add(`${scope}:${candidate.toLowerCase()}`);

  return candidate;
};

const readGroups = async (run: Run) => {
  const current = await readAll(run, 'properties_groups');
  const copied = new Set(current.map(idOf));
  const older = (await readAll(run, 'fields_groups')).filter((doc) => !copied.has(idOf(doc)));

  return [
    ...current.map((doc) => ({ collection: 'properties_groups', doc: readOr(Group, doc) })),
    ...older.map((doc) => ({ collection: 'fields_groups', doc: readOr(Group, doc) })),
  ];
};

/** Field groups; returns the ids that exist afterwards. */
const importGroups = async (run: Run) => {
  const groups = await readGroups(run);

  const { rows } = await run.pg.query<{ id: string; key: string }>(
    `SELECT id, content_type || ':' || lower(code) AS key FROM core_field_groups WHERE ${MINE}`,
  );

  const mine = new Set(groups.flatMap(({ doc }) => (doc ? [doc.id] : [])));
  const taken = new Set(rows.filter((row) => !mine.has(row.id)).map((row) => row.key));

  const built = groups.flatMap(({ collection, doc }) => {
    run.report.of(collection, 'core_field_groups');
    run.report.seen(collection, 1);

    const contentType = doc && CONTENT_TYPES[doc.contentType ?? ''];

    if (!doc || !contentType) {
      run.report.skip(
        collection,
        `no place for content type ${doc?.contentType || '(form)'}`,
        doc?.id,
      );

      return [];
    }

    const name = doc.name ?? doc.code ?? doc.id;
    const code = uniqueIn(taken, contentType, doc.code ?? name);
    const createdAt = createdOf(doc.id, doc.createdAt, doc.updatedAt);

    return [
      {
        collection,
        id: doc.id,
        row: [
          doc.id,
          contentType,
          name,
          code,
          doc.description,
          doc.order,
          createdAt,
          doc.updatedAt ?? createdAt,
        ],
      },
    ];
  });

  await unit(run, () =>
    inOrder(['properties_groups', 'fields_groups'], (collection) => {
      const from = built.filter((each) => each.collection === collection);

      return insert(run, {
        collection,
        table: 'core_field_groups',
        columns: [
          'id',
          'content_type',
          'name',
          'code',
          'description',
          'order',
          'created_at',
          'updated_at',
        ],
        rows: from.map((each) => each.row),
        keys: from.map((each) => each.id),
      });
    }),
  );
};

/** The field's row; `taken` holds the labels and codes already used per record type. */
export const fieldRow = (
  doc: FieldDocument,
  contentType: string,
  type: { type: string; validation: string | null },
  taken: { labels: Set<string>; codes: Set<string> },
  groups: Set<string>,
) => {
  const label = uniqueIn(taken.labels, contentType, doc.text ?? doc.name ?? doc.code ?? doc.id);
  const code = doc.code ? uniqueIn(taken.codes, contentType, doc.code) : null;
  const createdAt = createdOf(doc.id, doc.createdAt, doc.updatedAt);

  return [
    doc.id,
    contentType,
    label,
    type.type,
    doc.options.map((option) => option.label),
    doc.order,
    doc.groupId && groups.has(doc.groupId) ? doc.groupId : null,
    code,
    doc.description,
    doc.icon,
    type.validation,
    doc.configs.isVisible ?? doc.isVisible ?? true,
    doc.archivedAt,
    doc.configs.isRequired ?? doc.isRequired ?? false,
    doc.configs.isVisibleToCreate ?? doc.isVisibleToCreate ?? true,
    createdAt,
    doc.updatedAt ?? createdAt,
  ];
};

const FIELD_COLUMNS = [
  'id',
  'content_type',
  'label',
  'type',
  'options',
  'order',
  'group_id',
  'code',
  'description',
  'icon',
  'validation',
  'is_visible',
  'archived_at',
  'is_required',
  'is_visible_to_create',
  'created_at',
  'updated_at',
];

/** Old fields that core keeps, with their record type and core type. */
const readFields = async (run: Run) =>
  (await readAll(run, 'properties_fields')).flatMap((raw) => {
    run.report.seen('properties_fields');

    const doc = readOr(FieldDocument, raw);
    const contentType = doc && CONTENT_TYPES[doc.contentType ?? ''];
    const type = doc && FIELD_TYPES[doc.type ?? ''];

    if (!doc) run.report.skip('properties_fields', 'unreadable _id', idOf(raw));
    else if (!doc.contentType)
      run.report.skip('properties_fields', 'form field: plugin:frontline (forms)', doc.id);
    else if (!contentType)
      run.report.skip('properties_fields', `no place for content type ${doc.contentType}`, doc.id);
    else if (!type)
      run.report.skip('properties_fields', `no core type for ${doc.type ?? '?'}`, doc.id);

    return doc && contentType && type ? [{ doc, contentType, type }] : [];
  });

const importFieldRows = async (run: Run) => {
  run.report.of('properties_fields', 'core_fields');

  const fields = await readFields(run);
  const mine = new Set(fields.map(({ doc }) => doc.id));

  const { rows } = await run.pg.query<{ id: string; label: string; code: string | null }>(
    `SELECT id, content_type || ':' || lower(label) AS label, content_type || ':' || lower(code) AS code
       FROM core_fields WHERE plugin IS NULL AND ${MINE}`,
  );

  const others = rows.filter((row) => !mine.has(row.id));

  const taken = {
    labels: new Set(others.map((row) => row.label)),
    codes: new Set(others.flatMap((row) => (row.code ? [row.code] : []))),
  };

  const groups = new Set(
    (await run.pg.query<{ id: string }>(`SELECT id FROM core_field_groups WHERE ${MINE}`)).rows.map(
      (row) => row.id,
    ),
  );

  const built = fields.map(({ doc, contentType, type }) => {
    const row = fieldRow(doc, contentType, type, taken, groups);

    if (row[2] !== (doc.text ?? doc.name ?? doc.code ?? doc.id)) {
      run.report.note(
        'properties_fields',
        'label used twice for the record type; numbered',
        doc.id,
      );
    }

    return row;
  });

  await unit(run, async () => {
    await insert(run, {
      collection: 'properties_fields',
      table: 'core_fields',
      columns: FIELD_COLUMNS,
      rows: built,
      keys: fields.map(({ doc }) => doc.id),
    });
    await remember(
      run,
      'properties_fields',
      'field',
      fields.map(({ doc }) => [doc.id, doc.id]),
      true,
    );
  });
};

/** Field groups, then fields. */
export const importFields = async (run: Run) => {
  await importGroups(run);
  await importFieldRows(run);
};
