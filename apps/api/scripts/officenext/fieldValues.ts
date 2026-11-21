/**
 * Custom field values on customers, companies and products → `core_*_field_values`. Old records
 * kept them twice, typed in `customFieldsData` and plain in `propertiesData`; the typed copy wins.
 * Select options are stored by their label, as the fields list them. `trackedData` (what a
 * website or app sent about the person) becomes text fields in a "Tracked data" group.
 */
import type { Collection } from 'mongodb';
import { z } from 'zod';
import { inOrder } from '~/lib/sequence';
import { resolve } from './idMap';
import { FieldDocument, uniqueIn } from './fields';
import { fieldDocs } from './fieldSources';
import { eachBatch, insert, MINE, type Run, unit } from './run';
import { mainSource, v1Source } from './sources';
import { field, idOf, plain, readOr } from './values';

type Value = { text: string } | { number: number } | { date: string };

interface Meta {
  type: string;
  labels: Map<string, string>;
}

const Entry = z.object({
  field: field((value) => (typeof value === 'string' ? value : null)),
  value: z.unknown(),
});

const Holder = z.object({
  customFieldsData: field((value) =>
    Array.isArray(value) ? value.flatMap((item) => readOr(Entry, item) ?? []) : [],
  ),
  propertiesData: field((value) =>
    value && typeof value === 'object' && !Array.isArray(value) ? Object.entries(value) : [],
  ),
  trackedData: field((value) =>
    Array.isArray(value) ? value.flatMap((item) => readOr(Entry, item) ?? []) : [],
  ),
});

const textOf = (value: unknown) => {
  const flat = plain(value);

  if (flat === null || flat === undefined) return null;

  const written = typeof flat === 'string' ? flat.trim() : JSON.stringify(flat);

  return written && written !== '""' && written !== '[]' && written !== '{}' ? written : null;
};

/** One old value as core's typed values, one per position. */
export const valuesOf = (meta: Meta, value: unknown): Value[] => {
  const items = Array.isArray(value) ? value : [value];

  if (meta.type === 'number') {
    const number = typeof value === 'string' && value.trim() ? Number(value) : value;

    return typeof number === 'number' && Number.isFinite(number) ? [{ number }] : [];
  }

  if (meta.type === 'date') {
    const date = value instanceof Date || typeof value === 'string' ? new Date(value) : null;

    return date && !Number.isNaN(date.getTime()) ? [{ date: date.toISOString().slice(0, 10) }] : [];
  }

  if (['select', 'radio', 'multiselect', 'check'].includes(meta.type)) {
    return items.flatMap((item) => {
      const written = textOf(item);

      return written ? [{ text: meta.labels.get(written) ?? written }] : [];
    });
  }

  if (meta.type === 'list')
    return items.flatMap((item) => (textOf(item) ? [{ text: textOf(item) ?? '' }] : []));

  const written = textOf(value);

  return written ? [{ text: written }] : [];
};

/** Old field id → its core type and option labels, for fields core has for `contentType`. */
const metaOf = async (run: Run, contentType: string) => {
  const { rows } = await run.pg.query<{ id: string; type: string }>(
    `SELECT id, type FROM core_fields WHERE content_type = $1 AND ${MINE}`,
    [contentType],
  );

  const types = new Map(rows.map((row) => [row.id, row.type]));
  const metas = new Map<string, Meta>();

  for (const { raw } of await fieldDocs(run)) {
    const doc = readOr(FieldDocument, raw);
    const id = doc && resolve('field', doc.id);
    const type = id && types.get(id);

    if (doc && id && type) {
      metas.set(doc.id, {
        type,
        labels: new Map(doc.options.map((option) => [option.value, option.label])),
      });
    }
  }

  for (const [id, type] of types) if (!metas.has(id)) metas.set(id, { type, labels: new Map() });

  return metas;
};

/** Text fields for each `trackedData` name, in a "Tracked data" group of the record type. */
const trackedFields = async (run: Run, collection: Collection, contentType: string) => {
  const names: unknown[] = await collection.distinct('trackedData.field');
  const groupId = `tracked_${contentType}`;

  const { rows } = await run.pg.query<{ label: string }>(
    `SELECT content_type || ':' || lower(label) AS label FROM core_fields
      WHERE plugin IS NULL AND id NOT LIKE 'tracked\\_%' AND ${MINE}`,
  );

  const taken = new Set(rows.map((row) => row.label));

  const fields = names.flatMap((name) =>
    typeof name === 'string' && name.trim()
      ? [{ name, id: `tracked_${contentType}_${name.replaceAll(/[^A-Za-z0-9]/g, '_')}` }]
      : [],
  );

  await insert(run, {
    collection: `${collection.collectionName} (trackedData)`,
    table: 'core_field_groups',
    columns: ['id', 'content_type', 'name', 'code', 'description'],
    rows: [
      [
        groupId,
        contentType,
        'Tracked data',
        'tracked_data',
        'What a website or app sent about the record in old erxes',
      ],
    ],
    keys: [groupId],
  });
  await insert(run, {
    collection: `${collection.collectionName} (trackedData)`,
    table: 'core_fields',
    // No code: old names differ only by case (`userName`, `username`), and codes ignore case.
    columns: ['id', 'content_type', 'label', 'type', 'group_id'],
    rows: fields.map((each) => [
      each.id,
      contentType,
      uniqueIn(taken, contentType, each.name),
      'text',
      groupId,
    ]),
    keys: fields.map((each) => each.id),
  });

  return new Map(fields.map((each) => [each.name, each.id]));
};

const TARGETS = [
  { collection: 'customers', contentType: 'customer', table: 'core_customer_field_values' },
  { collection: 'companies', contentType: 'company', table: 'core_company_field_values' },
  { collection: 'products', contentType: 'product', table: 'core_product_field_values' },
] as const;

const valueRow = (recordId: string, fieldId: string, position: number, value: Value) => [
  recordId,
  fieldId,
  position,
  'text' in value ? value.text : null,
  'number' in value ? value.number : null,
  'date' in value ? value.date : null,
];

/** Each record's value rows, and why values were left out. */
export const rowsOfRecord = (
  recordId: string,
  holder: z.infer<typeof Holder>,
  metas: Map<string, Meta>,
  tracked: Map<string, string>,
) => {
  const values = new Map<string, unknown>();
  const missing: string[] = [];

  for (const [id, value] of holder.propertiesData) values.set(id, value);

  for (const entry of holder.customFieldsData)
    if (entry.field) values.set(entry.field, entry.value);

  const rows = [...values].flatMap(([oldId, value]) => {
    const meta = metas.get(oldId);

    if (!meta) {
      missing.push(oldId);

      return [];
    }

    return valuesOf(meta, value).map((each, position) =>
      valueRow(recordId, resolve('field', oldId), position, each),
    );
  });

  const trackedRows = holder.trackedData.flatMap((entry) => {
    const id = entry.field && tracked.get(entry.field);
    const written = textOf(entry.value);

    return id && written ? [valueRow(recordId, id, 0, { text: written })] : [];
  });

  return { rows: [...rows, ...trackedRows], missing };
};

/** Each target's sources: `erxes`'s records, and for contacts the v1 copy's that `erxes` lacks. */
const sourcesOf = async (run: Run) =>
  [
    ...TARGETS.map((target) => ({ target, source: mainSource(run, target.collection) })),
    ...(await Promise.all(
      TARGETS.filter((target) => target.contentType !== 'product').map(async (target) => ({
        target,
        source: await v1Source(run, target.collection),
      })),
    )),
  ] as const;

/** Field values of customers, companies and products. */
export const importFieldValues = async (run: Run) => {
  await inOrder(await sourcesOf(run), async ({ target, source }) => {
    const collection = source.db.collection(source.collection);
    const metas = await metaOf(run, target.contentType);
    const tracked = await unit(run, () => trackedFields(run, collection, target.contentType));
    const name = `${source.name} (field values)`;

    run.report.of(name, target.table);

    await eachBatch(
      run,
      collection,
      async (documents) => {
        const rows = documents.flatMap((raw) => {
          const holder = readOr(Holder, raw);
          const recordId = resolve(target.contentType, idOf(raw));

          const built = holder
            ? rowsOfRecord(recordId, holder, metas, tracked)
            : { rows: [], missing: [] };

          for (const id of built.missing)
            run.report.skip(name, 'field no longer exists in old erxes', `${recordId}:${id}`);

          return built.rows;
        });

        await insert(run, {
          collection: name,
          table: target.table,
          columns: [
            'record_id',
            'field_id',
            'position',
            'text_value',
            'number_value',
            'date_value',
          ],
          rows,
          keys: rows.map((row) => `${String(row[0])}:${String(row[1])}`),
        });
      },
      {
        ...source.filter,
        // Merged-away contacts gave their values to the record they went into.
        ...(target.contentType === 'product' ? {} : { status: { $nin: ['deleted', 'Deleted'] } }),
        $or: [
          { 'customFieldsData.0': { $exists: true } },
          { 'trackedData.0': { $exists: true } },
          { propertiesData: { $gt: {} } },
        ],
      },
      name,
    );
  });
};
